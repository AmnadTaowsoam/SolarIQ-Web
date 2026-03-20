import os
import json
import asyncio
from google.cloud import pubsub_v1
from google.cloud import storage
from skills.bill_ocr import extract_bill_data

# Mocks for external services not fully defined in WK-010
def update_user_context(user_id: str, bill_data: dict):
    print(f"Mock Context Update for user {user_id}: {bill_data}")
    # In reality, this would save to a database or user session store

def send_line_reply(user_id: str, message: str):
    print(f"Mock LINE Reply to {user_id}: {message}")
    # In reality, this calls LINE Messaging API

async def process_ocr_message(message: pubsub_v1.subscriber.message.Message):
    """Processes an incoming Pub/Sub message containing an image reference."""
    try:
        data = json.loads(message.data.decode("utf-8"))
        user_id = data.get("user_id")
        image_uri = data.get("image_uri") # e.g., gs://bucket/path/to/image.jpg
        
        if not user_id or not image_uri:
            print("Invalid message format: missing user_id or image_uri")
            message.nack()
            return

        # Fetch image bytes from GCS
        storage_client = storage.Client()
        bucket_name = image_uri.split("/")[2]
        blob_name = "/".join(image_uri.split("/")[3:])
        
        try:
            bucket = storage_client.bucket(bucket_name)
            blob = bucket.blob(blob_name)
            image_bytes = blob.download_as_bytes()
        except Exception as e:
            print(f"Failed to download image {image_uri}: {e}")
            send_line_reply(user_id, "à¸‚à¸­à¸­à¸ à¸±à¸¢ à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¹‚à¸«à¸¥à¸”à¸£à¸¹à¸›à¸ à¸²à¸žà¹„à¸”à¹‰ à¸à¸£à¸¸à¸“à¸²à¸¥à¸­à¸‡à¹ƒà¸«à¸¡à¹ˆ")
            message.ack()
            return

        # Perform OCR
        bill_data = await extract_bill_data(image_bytes)
        
        # Mask PII (account_number) before logging/storing as per PDPA
        masked_account = f"{bill_data.account_number[:4]}****{bill_data.account_number[-4:]}" if bill_data.account_number and len(bill_data.account_number) >= 8 else "****"
        log_data = bill_data.model_dump()
        log_data["account_number"] = masked_account
        
        update_user_context(user_id, log_data)
        
        # Determine reply based on confidence
        if bill_data.confidence >= 0.7:
            reply_msg = f"à¸ªà¸à¸±à¸”à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¸³à¹€à¸£à¹‡à¸ˆ!\nà¸œà¸¹à¹‰à¹ƒà¸«à¹‰à¸šà¸£à¸´à¸à¸²à¸£: {bill_data.provider}\nà¸«à¸¡à¸²à¸¢à¹€à¸¥à¸‚: {masked_account}\nà¸„à¹ˆà¸²à¹„à¸Ÿà¸£à¸§à¸¡: {bill_data.total_amount_thb} à¸šà¸²à¸—\nà¸«à¸™à¹ˆà¸§à¸¢: {bill_data.total_kwh} kWh"
            send_line_reply(user_id, reply_msg)
        else:
            reply_msg = f"à¸£à¸°à¸šà¸šà¹„à¸¡à¹ˆà¹à¸™à¹ˆà¹ƒà¸ˆà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸šà¸²à¸‡à¸ªà¹ˆà¸§à¸™ à¸à¸£à¸¸à¸“à¸²à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸š\nà¸„à¹ˆà¸²à¹„à¸Ÿ: {bill_data.total_amount_thb}\n(à¸«à¸²à¸à¹„à¸¡à¹ˆà¸–à¸¹à¸à¸•à¹‰à¸­à¸‡ à¸à¸£à¸¸à¸“à¸²à¸à¸”à¹à¸à¹‰à¹„à¸‚à¸«à¸£à¸·à¸­à¸ªà¹ˆà¸‡à¸£à¸¹à¸›à¹ƒà¸«à¸¡à¹ˆ)"
            send_line_reply(user_id, reply_msg)
            
        message.ack()
        
    except ValueError as e:
        # Validation error (e.g. invalid ranges)
        print(f"Validation error for message {message.message_id}: {e}")
        send_line_reply(user_id, "à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸šà¸´à¸¥à¹„à¸¡à¹ˆà¸–à¸¹à¸à¸•à¹‰à¸­à¸‡ à¸à¸£à¸¸à¸“à¸²à¸–à¹ˆà¸²à¸¢à¸£à¸¹à¸›à¸šà¸´à¸¥à¹ƒà¸«à¸¡à¹ˆà¹ƒà¸«à¹‰à¸Šà¸±à¸”à¹€à¸ˆà¸™")
        message.ack()
    except Exception as e:
        print(f"Unexpected error processing message {message.message_id}: {e}")
        send_line_reply(user_id, "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”à¹ƒà¸™à¸à¸²à¸£à¸­à¹ˆà¸²à¸™à¸šà¸´à¸¥ à¸à¸£à¸¸à¸“à¸²à¸¥à¸­à¸‡à¹ƒà¸«à¸¡à¹ˆà¸ à¸²à¸¢à¸«à¸¥à¸±à¸‡")
        message.nack() # Retry later

def main():
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "mock-project-id")
    subscription_id = os.environ.get("PUBSUB_SUBSCRIPTION_ID", "bill-ocr-sub")
    
    subscriber = pubsub_v1.SubscriberClient()
    subscription_path = subscriber.subscription_path(project_id, subscription_id)

    def callback(message: pubsub_v1.subscriber.message.Message):
        # We need to run the async function in an event loop since pubsub callback is sync
        asyncio.run(process_ocr_message(message))

    streaming_pull_future = subscriber.subscribe(subscription_path, callback=callback)
    print(f"Listening for messages on {subscription_path}..\n")

    try:
        streaming_pull_future.result()
    except KeyboardInterrupt:
        streaming_pull_future.cancel()

if __name__ == "__main__":
    main()