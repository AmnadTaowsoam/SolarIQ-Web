"""
Fix missing translation keys in messages/th.json and messages/en.json.
Scans all .tsx files for useTranslations() and t() calls,
then adds any missing keys with appropriate translations.
"""

import json
import os
import re
from pathlib import Path
from collections import defaultdict

ROOT = Path(r"D:/SolarIQ-Application/SolarIQ-Web")
SRC = ROOT / "src"
TH_JSON = ROOT / "messages" / "th.json"
EN_JSON = ROOT / "messages" / "en.json"


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def resolve_namespace(data, namespace):
    parts = namespace.split(".")
    node = data
    for p in parts:
        if isinstance(node, dict) and p in node:
            node = node[p]
        else:
            return None
    return node


def ensure_namespace(data, namespace):
    """Ensure the namespace path exists, creating dicts as needed. Returns the namespace node."""
    parts = namespace.split(".")
    node = data
    for p in parts:
        if p not in node or not isinstance(node.get(p), dict):
            node[p] = {}
        node = node[p]
    return node


def key_exists(ns_data, key):
    parts = key.split(".")
    node = ns_data
    for p in parts:
        if isinstance(node, dict) and p in node:
            node = node[p]
        else:
            return False
    return True


def set_nested_key(ns_data, key, value):
    """Set a dotted key in a nested dict, creating intermediate dicts as needed.
    Does NOT overwrite existing values."""
    parts = key.split(".")
    node = ns_data
    for p in parts[:-1]:
        if p not in node or not isinstance(node.get(p), dict):
            node[p] = {}
        node = node[p]
    if parts[-1] not in node:
        node[parts[-1]] = value


def scan_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    ns_pattern = re.compile(
        r"""(?:const\s+(\w+)\s*=\s*)?useTranslations\(\s*['"]([^'"]+)['"]\s*\)""",
    )

    assignments = []
    for m in ns_pattern.finditer(content):
        var_name = m.group(1) or "t"
        namespace = m.group(2)
        assignments.append((var_name, namespace))

    keys_used = []
    for var_name, namespace in assignments:
        key_pattern = re.compile(
            rf"""\b{re.escape(var_name)}\(\s*['"]([^'"]+)['"]"""
        )
        for m in key_pattern.finditer(content):
            key = m.group(1)
            keys_used.append((namespace, key))

    return keys_used


# ============================================================
# Translation mappings
# ============================================================

def generate_en_translation(namespace, key):
    """Generate an English translation based on namespace and key name."""
    # Full key for context
    full_key = f"{namespace}.{key}"

    # Comprehensive mapping of known keys
    translations = {
        # aboutPage
        "aboutPage.title": "About SolarIQ",
        "aboutPage.subtitle": "Smart Solar Energy Analysis Platform",
        "aboutPage.description": "SolarIQ is an intelligent platform for analyzing solar energy potential, helping you make informed decisions about solar panel installation.",
        "aboutPage.loading": "Loading...",
        "aboutPage.error": "An error occurred",
        "aboutPage.close": "Close",
        "aboutPage.copyright": "All rights reserved",
        "aboutPage.version": "Version",
        "aboutPage.contact.title": "Contact Us",
        "aboutPage.contact.email": "Email",
        "aboutPage.contact.call": "Call",
        "aboutPage.contact.website": "Website",
        "aboutPage.features.billScanning.title": "Bill Scanning",
        "aboutPage.features.billScanning.description": "Scan your electricity bill to automatically calculate savings",
        "aboutPage.features.billScanning.icon": "receipt",
        "aboutPage.features.carbonFootprint.title": "Carbon Footprint",
        "aboutPage.features.carbonFootprint.description": "Calculate your carbon reduction from solar energy",
        "aboutPage.features.carbonFootprint.icon": "leaf",
        "aboutPage.features.locationAnalysis.title": "Location Analysis",
        "aboutPage.features.locationAnalysis.description": "Analyze solar potential based on your location",
        "aboutPage.features.locationAnalysis.icon": "map-pin",
        "aboutPage.features.pdfQuote.title": "PDF Quote",
        "aboutPage.features.pdfQuote.description": "Generate professional PDF quotes for customers",
        "aboutPage.features.pdfQuote.icon": "file-text",
        "aboutPage.features.roiCalculation.title": "ROI Calculation",
        "aboutPage.features.roiCalculation.description": "Calculate return on investment for solar installations",
        "aboutPage.features.roiCalculation.icon": "calculator",
        "aboutPage.stats.title": "Platform Statistics",
        "aboutPage.stats.analyses": "Analyses Completed",
        "aboutPage.stats.installations": "Installations",
        "aboutPage.stats.savings": "Total Savings",

        # contactPage
        "contactPage.title": "Contact Information",
        "contactPage.description": "Please provide your contact details",
        "contactPage.loading": "Loading...",
        "contactPage.pdpaNotice": "Your information is protected under PDPA (Personal Data Protection Act)",
        "contactPage.success.title": "Information saved successfully",
        "contactPage.success.redirecting": "Redirecting...",
        "contactPage.form.name": "Full Name",
        "contactPage.form.nameRequired": "Name is required",
        "contactPage.form.email": "Email",
        "contactPage.form.emailInvalid": "Invalid email format",
        "contactPage.form.phone": "Phone Number",
        "contactPage.form.phoneRequired": "Phone number is required",
        "contactPage.form.phoneInvalid": "Invalid phone number format",
        "contactPage.form.address": "Address",
        "contactPage.form.addressPlaceholder": "Enter your address",
        "contactPage.form.district": "District",
        "contactPage.form.districtPlaceholder": "Enter your district",
        "contactPage.form.province": "Province",
        "contactPage.form.selectProvince": "Select province",
        "contactPage.form.save": "Save",
        "contactPage.form.saving": "Saving...",
        "contactPage.form.update": "Update",

        # knowledge
        "knowledge.title": "Knowledge Base",
        "knowledge.description": "Manage documents and data for AI-powered responses",
        "knowledge.documents.title": "Documents",
        "knowledge.documents.titleColumn": "Title",
        "knowledge.documents.sourceColumn": "Source",
        "knowledge.documents.chunksColumn": "Chunks",
        "knowledge.documents.updatedColumn": "Updated",
        "knowledge.documents.actionsColumn": "Actions",
        "knowledge.documents.delete": "Delete",
        "knowledge.errors.contentRequired": "Content is required",
        "knowledge.messages.confirmDelete": "Are you sure you want to delete this document?",
        "knowledge.search.button": "Search",
        "knowledge.search.clear": "Clear",
        "knowledge.search.placeholder": "Search documents...",
        "knowledge.search.results": "Search Results",
        "knowledge.search.score": "Relevance Score",
        "knowledge.stats.sources": "Sources",
        "knowledge.stats.totalChunks": "Total Chunks",
        "knowledge.stats.totalDocuments": "Total Documents",
        "knowledge.upload.button": "Upload Document",
        "knowledge.upload.cancel": "Cancel",
        "knowledge.upload.contentLabel": "Content",
        "knowledge.upload.contentPlaceholder": "Enter document content...",
        "knowledge.upload.metadataLabel": "Metadata",
        "knowledge.upload.metadataOptional": "(Optional)",
        "knowledge.upload.metadataPlaceholder": "Enter metadata as JSON...",
        "knowledge.upload.modalTitle": "Upload New Document",
        "knowledge.upload.sourceLabel": "Source",
        "knowledge.upload.submit": "Submit",
        "knowledge.upload.titleLabel": "Title",
        "knowledge.upload.titlePlaceholder": "Enter document title...",

        # analyzePage
        "analyzePage.title": "Solar Analysis",
        "analyzePage.subtitle": "Analyze solar energy potential for your location",
        "analyzePage.analyzeButton": "Analyze",
        "analyzePage.analyzeHint": "Enter location and electricity bill details to start analysis",
        "analyzePage.inputForm.title": "Input Information",
        "analyzePage.inputForm.address": "Address",
        "analyzePage.inputForm.addressPlaceholder": "Enter address or location",
        "analyzePage.inputForm.latitude": "Latitude",
        "analyzePage.inputForm.latitudeHint": "e.g., 13.7563",
        "analyzePage.inputForm.longitude": "Longitude",
        "analyzePage.inputForm.longitudeHint": "e.g., 100.5018",
        "analyzePage.inputForm.monthlyBill": "Monthly Electricity Bill",
        "analyzePage.inputForm.monthlyBillHint": "Average monthly electricity cost in Baht",
        "analyzePage.inputForm.useCurrentLocation": "Use Current Location",
        "analyzePage.inputForm.useDefaultLocation": "Use Default Location",
        "analyzePage.locationPreview.title": "Location Preview",
        "analyzePage.locationPreview.subtitle": "Solar potential for selected location",
        "analyzePage.locationPreview.coordinates": "Coordinates",
        "analyzePage.locationPreview.region": "Region",
        "analyzePage.locationPreview.regionNorth": "Northern Thailand",
        "analyzePage.locationPreview.regionCentral": "Central Thailand",
        "analyzePage.locationPreview.regionSouth": "Southern Thailand",
        "analyzePage.locationPreview.avgSolarPotential": "Average Solar Potential",
        "analyzePage.locationPreview.hoursPerYear": "Peak Sun Hours/Year",
        "analyzePage.locationPreview.reliabilityIndex": "Reliability Index",
        "analyzePage.locationPreview.forecast7day": "7-Day Forecast",
        "analyzePage.locationPreview.pm25impact": "PM2.5 Impact",
        "analyzePage.locationPreview.financingComparison": "Financing Comparison",
        "analyzePage.locationPreview.investment25yr": "25-Year Investment",
        "analyzePage.locationPreview.roofPlan": "Roof Plan",
        "analyzePage.locationPreview.youWillReceive": "You Will Receive",
        "analyzePage.messages.fillAllFields": "Please fill in all required fields",
        "analyzePage.messages.invalidBill": "Please enter a valid electricity bill amount",
        "analyzePage.messages.invalidLatitude": "Please enter a valid latitude",
        "analyzePage.messages.invalidLongitude": "Please enter a valid longitude",
        "analyzePage.messages.locationSuccess": "Location obtained successfully",
        "analyzePage.messages.locationFailed": "Failed to get location",
        "analyzePage.messages.geolocationNotSupported": "Geolocation is not supported by your browser",
        "analyzePage.messages.analysisSuccess": "Analysis completed successfully",
        "analyzePage.messages.analysisFailed": "Analysis failed. Please try again.",
        "analyzePage.results.title": "Analysis Results",
        "analyzePage.tabs.overview": "Overview",
        "analyzePage.tabs.solar": "Solar",
        "analyzePage.tabs.financial": "Financial",
        "analyzePage.tabs.equipment": "Equipment",
        "analyzePage.tabs.roof": "Roof",
        "analyzePage.tabs.forecast": "Forecast",
        "analyzePage.tabs.reliability": "Reliability",
        "analyzePage.tabs.incentives": "Incentives",
        "analyzePage.tabs.data": "Data",

        # settingsPage
        "settingsPage.loading": "Loading...",
        "settingsPage.version": "Version",
        "settingsPage.contact": "Contact Support",
        "settingsPage.account.title": "Account Information",
        "settingsPage.account.name": "Name",
        "settingsPage.account.email": "Email",
        "settingsPage.account.phone": "Phone",
        "settingsPage.account.status": "Status",
        "settingsPage.account.edit": "Edit",
        "settingsPage.account.addContact": "Add Contact",
        "settingsPage.account.noContact": "No contact information",
        "settingsPage.consent.title": "Consent Management",
        "settingsPage.tax.title": "Tax Information",
        "settingsPage.tax.subtitle": "Company tax information for invoices and receipts",
        "settingsPage.tax.taxId": "Tax ID",
        "settingsPage.tax.branchNumber": "Branch Number",
        "settingsPage.tax.companyNameTh": "Company Name (Thai)",
        "settingsPage.tax.companyNameEn": "Company Name (English)",
        "settingsPage.tax.taxAddress": "Tax Address",
        "settingsPage.tax.contactPerson": "Contact Person",
        "settingsPage.tax.contactEmail": "Contact Email",
        "settingsPage.tax.contactPhone": "Contact Phone",
        "settingsPage.tax.save": "Save",
        "settingsPage.tax.reset": "Reset",
        "settingsPage.dangerZone.title": "Danger Zone",
        "settingsPage.dangerZone.deleteAll": "Delete All Data",
        "settingsPage.dangerZone.deleteNotice": "This action cannot be undone. All your data will be permanently deleted.",
        "settingsPage.dangerZone.deleteConfirm": "Are you sure you want to delete all data?",
        "settingsPage.errors.loadError": "Failed to load settings",
        "settingsPage.errors.deleteError": "Failed to delete data",

        # onboardingPage
        "onboardingPage.step3.addMember": "Add Team Member",
        "onboardingPage.step3.memberNumber": "Member {number}",
        "onboardingPage.step3.noMembers": "No team members added yet",
        "onboardingPage.step3.roleAdmin": "Admin",
        "onboardingPage.step3.roleMember": "Member",
        "onboardingPage.step3.sendInvites": "Send Invitations",
        "onboardingPage.step3.sendingInvites": "Sending invitations...",
        "onboardingPage.step3.skip": "Skip",
        "onboardingPage.step4.baht": "Baht",
        "onboardingPage.step4.createLead": "Create Lead",
        "onboardingPage.step4.creatingLead": "Creating lead...",
        "onboardingPage.step4.customerName": "Customer Name",
        "onboardingPage.step4.infoMessage": "Create your first lead to get started",
        "onboardingPage.step4.monthlyBill": "Monthly Electricity Bill",
        "onboardingPage.step4.phone": "Phone Number",
        "onboardingPage.step4.province": "Province",
        "onboardingPage.step4.selectProvince": "Select Province",
        "onboardingPage.step5.company": "Company",
        "onboardingPage.step5.goToDashboard": "Go to Dashboard",
        "onboardingPage.step5.leadCreated": "Lead created",
        "onboardingPage.step5.leadLabel": "First Lead",
        "onboardingPage.step5.leadNotCreated": "Lead not created",
        "onboardingPage.step5.lineConnected": "LINE connected",
        "onboardingPage.step5.lineLabel": "LINE Integration",
        "onboardingPage.step5.lineNotConnected": "LINE not connected",
        "onboardingPage.step5.preparingDashboard": "Preparing your dashboard...",
        "onboardingPage.step5.setupSummary": "Setup Summary",
        "onboardingPage.step5.skipped": "Skipped",
        "onboardingPage.step5.teamInvited": "Team invited",
        "onboardingPage.step5.teamLabel": "Team",
        "onboardingPage.step5.teamNotInvited": "Team not invited",

        # addActivityModal
        "addActivityModal.addActivity": "Add Activity",
        "addActivityModal.subtitle": "Select a date to add or view activities",
        "addActivityModal.selectDatePrompt": "Select a date",
        "addActivityModal.noEventsToday": "No events today",
        "addActivityModal.overdue": "Overdue",
        "addActivityModal.upcomingEvents": "Upcoming Events",
        "addActivityModal.eventsForDate": "Events for this date",
        "addActivityModal.daysShort.mon": "Mon",
        "addActivityModal.daysShort.tue": "Tue",
        "addActivityModal.daysShort.wed": "Wed",
        "addActivityModal.daysShort.thu": "Thu",
        "addActivityModal.daysShort.fri": "Fri",
        "addActivityModal.daysShort.sat": "Sat",
        "addActivityModal.daysShort.sun": "Sun",
        "addActivityModal.months.january": "January",
        "addActivityModal.months.february": "February",
        "addActivityModal.months.march": "March",
        "addActivityModal.months.april": "April",
        "addActivityModal.months.may": "May",
        "addActivityModal.months.june": "June",
        "addActivityModal.months.july": "July",
        "addActivityModal.months.august": "August",
        "addActivityModal.months.september": "September",
        "addActivityModal.months.october": "October",
        "addActivityModal.months.november": "November",
        "addActivityModal.months.december": "December",
        "addActivityModal.eventTypes.installation": "Installation",
        "addActivityModal.eventTypes.maintenance": "Maintenance",
        "addActivityModal.eventTypes.service_request": "Service Request",

        # analytics.funnel
        "analytics.funnel.title": "Sales Funnel",
        "analytics.funnel.subtitle": "Track your sales pipeline performance",
        "analytics.funnel.funnelTitle": "Conversion Funnel",
        "analytics.funnel.conversion": "Conversion",
        "analytics.funnel.dropOff": "Drop Off",
        "analytics.funnel.overallConversion": "Overall Conversion",
        "analytics.funnel.totalRevenue": "Total Revenue",
        "analytics.funnel.avgTimeToPurchase": "Avg. Time to Purchase",
        "analytics.funnel.insights": "Insights",
        "analytics.funnel.insight1Title": "Lead Quality",
        "analytics.funnel.insight1Desc": "Focus on high-quality leads for better conversion rates",
        "analytics.funnel.insight2Title": "Follow-up Speed",
        "analytics.funnel.insight2Desc": "Faster follow-ups increase conversion probability",
        "analytics.funnel.insight3Title": "Quote Optimization",
        "analytics.funnel.insight3Desc": "Optimize quote pricing to improve win rates",
        "analytics.funnel.insight4Title": "Customer Retention",
        "analytics.funnel.insight4Desc": "Maintain relationships for referrals and repeat business",
        "analytics.funnel.export": "Export",
        "analytics.funnel.refresh": "Refresh",

        # calendarPage
        "calendarPage.add": "Add",
        "calendarPage.adding": "Adding...",
        "calendarPage.cancel": "Cancel",
        "calendarPage.error": "An error occurred",
        "calendarPage.fields.activityName": "Activity Name",
        "calendarPage.fields.customerName": "Customer Name",
        "calendarPage.fields.date": "Date",
        "calendarPage.fields.notes": "Notes",
        "calendarPage.fields.time": "Time",
        "calendarPage.fields.type": "Type",

        # chat
        "chat.conversationClosed": "This conversation has been closed",
        "chat.loadMore": "Load More",
        "chat.quickReplies": "Quick Replies",
        "chat.statusActive": "Active",
        "chat.statusClosed": "Closed",
        "chat.system": "System",
        "chat.you": "You",

        # chatPage
        "chatPage.title": "Chat",
        "chatPage.underDevelopment": "This feature is under development",

        # consentPage
        "consentPage.title": "Consent Management",
        "consentPage.description": "Manage your data consent preferences",
        "consentPage.loading": "Loading...",
        "consentPage.pdpaNotice": "Under Thailand's PDPA, you have the right to manage your personal data consent",
        "consentPage.dataRightsLink": "View Your Data Rights",
        "consentPage.actions.save": "Save Preferences",
        "consentPage.actions.skip": "Skip",
        "consentPage.actions.submitting": "Saving...",
        "consentPage.consents.grantedAt": "Granted at",
        "consentPage.dpoContact.title": "Data Protection Officer",
        "consentPage.dpoContact.email": "Email",
        "consentPage.dpoContact.phone": "Phone",
        "consentPage.errors.general": "An error occurred",
        "consentPage.errors.save": "Failed to save consent preferences",
        "consentPage.rights.title": "Your Rights",
        "consentPage.rights.description": "You have the right to access, correct, and delete your personal data",
        "consentPage.success.title": "Preferences saved successfully",
        "consentPage.success.redirecting": "Redirecting...",
        "consentPage.types.analysisResults.label": "Analysis Results",
        "consentPage.types.analysisResults.description": "Share your solar analysis results with installers",
        "consentPage.types.analysisResults.icon": "chart",
        "consentPage.types.contactSharing.label": "Contact Sharing",
        "consentPage.types.contactSharing.description": "Share your contact information with solar installers",
        "consentPage.types.contactSharing.icon": "users",
        "consentPage.types.marketing.label": "Marketing",
        "consentPage.types.marketing.description": "Receive promotional offers and updates",
        "consentPage.types.marketing.icon": "mail",
        "consentPage.types.proposalSharing.label": "Proposal Sharing",
        "consentPage.types.proposalSharing.description": "Share proposals with relevant parties",
        "consentPage.types.proposalSharing.icon": "file",

        # dataRightsPage
        "dataRightsPage.title": "Your Data Rights",
        "dataRightsPage.loading": "Loading...",
        "dataRightsPage.pdpaReference": "Rights under PDPA Section 30-36",
        "dataRightsPage.deleteSuccess": "Data deleted successfully",
        "dataRightsPage.actions.title": "Actions",
        "dataRightsPage.actions.download": "Download My Data",
        "dataRightsPage.actions.downloading": "Downloading...",
        "dataRightsPage.actions.edit": "Edit My Data",
        "dataRightsPage.actions.delete": "Delete My Data",
        "dataRightsPage.actions.withdraw": "Withdraw Consent",
        "dataRightsPage.dataSummary.title": "Data Summary",
        "dataRightsPage.dataSummary.name": "Name",
        "dataRightsPage.dataSummary.email": "Email",
        "dataRightsPage.dataSummary.phone": "Phone",
        "dataRightsPage.dataSummary.address": "Address",
        "dataRightsPage.dataSummary.province": "Province",
        "dataRightsPage.dataSummary.analysisHistory": "Analysis History",
        "dataRightsPage.dataSummary.consentHistory": "Consent History",
        "dataRightsPage.deleteModal.title": "Delete All Data",
        "dataRightsPage.deleteModal.description": "This action cannot be undone. All your personal data will be permanently deleted.",
        "dataRightsPage.deleteModal.confirm": "Delete",
        "dataRightsPage.deleteModal.cancel": "Cancel",
        "dataRightsPage.deleteModal.submitting": "Deleting...",
        "dataRightsPage.dpoContact.title": "Data Protection Officer",
        "dataRightsPage.dpoContact.email": "Email",
        "dataRightsPage.dpoContact.phone": "Phone",

        # createDealModal
        "createDealModal.all": "All",
        "createDealModal.createDeal": "Create Deal",
        "createDealModal.subtitle": "Manage your deals pipeline",
        "createDealModal.totalValue": "Total Value",
        "createDealModal.progress": "Progress",
        "createDealModal.steps": "Steps",
        "createDealModal.empty.title": "No deals yet",
        "createDealModal.empty.description": "Create your first deal to get started",
        "createDealModal.stats.total": "Total",
        "createDealModal.stats.inProgress": "In Progress",
        "createDealModal.stats.completed": "Completed",

        # dealsPage
        "dealsPage.cancel": "Cancel",
        "dealsPage.create": "Create",
        "dealsPage.creating": "Creating...",
        "dealsPage.error": "An error occurred",
        "dealsPage.fields.customerName": "Customer Name",
        "dealsPage.fields.address": "Address",
        "dealsPage.fields.systemSize": "System Size (kW)",
        "dealsPage.fields.totalValue": "Total Value (Baht)",
        "dealsPage.fields.stage": "Stage",
        "dealsPage.fields.notes": "Notes",

        # historyPage
        "historyPage.title": "Analysis History",
        "historyPage.subtitle": "View your previous solar analyses",
        "historyPage.loading": "Loading...",
        "historyPage.error": "Failed to load history",
        "historyPage.retry": "Retry",
        "historyPage.empty.title": "No analysis history",
        "historyPage.empty.description": "You haven't performed any solar analyses yet",
        "historyPage.empty.startAnalysis": "Start Analysis",
        "historyPage.item.panels": "Panels",
        "historyPage.item.payback": "Payback",
        "historyPage.item.years": "years",
        "historyPage.item.addressNotSpecified": "Address not specified",

        # invoicesPage
        "invoicesPage.empty": "No invoices found",
        "invoicesPage.history.title": "Invoice History",
        "invoicesPage.history.subtitle": "View your billing history",
        "invoicesPage.table.documentNumber": "Document Number",
        "invoicesPage.table.documentType": "Document Type",
        "invoicesPage.table.issuedDate": "Issued Date",
        "invoicesPage.table.status": "Status",
        "invoicesPage.table.total": "Total",
        "invoicesPage.table.action": "Action",

        # maintenanceDetailPage
        "maintenanceDetailPage.title": "Maintenance Details",
        "maintenanceDetailPage.addressNotSpecified": "Address not specified",
        "maintenanceDetailPage.notFound": "System not found",
        "maintenanceDetailPage.status.active": "Active",
        "maintenanceDetailPage.systemInfo.systemSize": "System Size",
        "maintenanceDetailPage.systemInfo.solarPanels": "Solar Panels",
        "maintenanceDetailPage.systemInfo.inverter": "Inverter",
        "maintenanceDetailPage.systemInfo.installationDate": "Installation Date",
        "maintenanceDetailPage.warranty.panel": "Panel Warranty",
        "maintenanceDetailPage.warranty.inverter": "Inverter Warranty",
        "maintenanceDetailPage.warranty.installation": "Installation Warranty",
        "maintenanceDetailPage.records.title": "Maintenance Records",
        "maintenanceDetailPage.records.addRecord": "Add Record",
        "maintenanceDetailPage.records.noRecords": "No maintenance records",
        "maintenanceDetailPage.records.save": "Save",
        "maintenanceDetailPage.records.costLabel": "Cost (Baht)",
        "maintenanceDetailPage.records.costPlaceholder": "Enter cost",
        "maintenanceDetailPage.records.technicianLabel": "Technician",
        "maintenanceDetailPage.records.technicianPlaceholder": "Enter technician name",
        "maintenanceDetailPage.records.descriptionPlaceholder": "Enter description",
        "maintenanceDetailPage.records.type.cleaning": "Cleaning",
        "maintenanceDetailPage.records.type.inspection": "Inspection",
        "maintenanceDetailPage.records.type.repair": "Repair",
        "maintenanceDetailPage.records.type.replacement": "Replacement",
        "maintenanceDetailPage.schedule.title": "Maintenance Schedule",
        "maintenanceDetailPage.schedule.addSchedule": "Add Schedule",
        "maintenanceDetailPage.schedule.noSchedule": "No schedule set",
        "maintenanceDetailPage.schedule.nextDue": "Next Due",
        "maintenanceDetailPage.schedule.notSet": "Not set",
        "maintenanceDetailPage.schedule.everyXMonths": "Every {count} months",
        "maintenanceDetailPage.schedule.notes": "Notes",
        "maintenanceDetailPage.schedule.save": "Save",
        "maintenanceDetailPage.schedule.frequency.3": "Every 3 months",
        "maintenanceDetailPage.schedule.frequency.6": "Every 6 months",
        "maintenanceDetailPage.schedule.frequency.12": "Every 12 months",
        "maintenanceDetailPage.schedule.type.cleaning": "Cleaning",
        "maintenanceDetailPage.schedule.type.inspection": "Inspection",
        "maintenanceDetailPage.schedule.type.general": "General",
        "maintenanceDetailPage.schedule.type.inverterCheck": "Inverter Check",

        # mapPickerPage
        "mapPickerPage.title": "Select Location",
        "mapPickerPage.subtitle": "Tap on the map to select your location",
        "mapPickerPage.address": "Address",
        "mapPickerPage.loading": "Loading map...",
        "mapPickerPage.confirm": "Confirm Location",
        "mapPickerPage.confirming": "Confirming...",
        "mapPickerPage.selectOnMap": "Select on Map",
        "mapPickerPage.myHomeLocation": "My Home Location",
        "mapPickerPage.pleaseSelectLocation": "Please select a location on the map",
        "mapPickerPage.checkInternetConnection": "Please check your internet connection",
        "mapPickerPage.errors.geocodeError": "Failed to get address from location",
        "mapPickerPage.errors.locationError": "Failed to get your location",
        "mapPickerPage.errors.submitError": "Failed to submit location",

        # proposalPage
        "proposalPage.title": "Solar Proposal",
        "proposalPage.subtitle": "Review your solar installation proposal",
        "proposalPage.loading": "Loading proposal...",
        "proposalPage.document.title": "Proposal Document",
        "proposalPage.document.openFullPdf": "Open Full PDF",
        "proposalPage.summary.title": "System Summary",
        "proposalPage.summary.systemSize": "System Size",
        "proposalPage.summary.yearlyEnergy": "Yearly Energy",
        "proposalPage.summary.estimatedPrice": "Estimated Price",
        "proposalPage.roi.title": "Return on Investment",
        "proposalPage.roi.monthlySavings": "Monthly Savings",
        "proposalPage.roi.payback": "Payback Period",
        "proposalPage.roi.savings25Years": "25-Year Savings",
        "proposalPage.actions.shareToLine": "Share via LINE",
        "proposalPage.actions.sharing": "Sharing...",
        "proposalPage.actions.contactInstaller": "Contact Installer",
        "proposalPage.status.generating": "Generating",
        "proposalPage.status.generatingDescription": "Your proposal is being generated...",
        "proposalPage.status.error": "Error",
        "proposalPage.status.errorDescription": "Failed to generate proposal",
        "proposalPage.errors.loadError": "Failed to load proposal",
        "proposalPage.errors.notFound": "Proposal not found",
        "proposalPage.errors.noLeadId": "Lead ID not found",
        "proposalPage.errors.shareError": "Failed to share proposal",
        "proposalPage.flexMessage.title": "Solar Proposal",
        "proposalPage.flexMessage.systemSize": "System Size",
        "proposalPage.flexMessage.panels": "Panels",
        "proposalPage.flexMessage.monthlySavings": "Monthly Savings",
        "proposalPage.flexMessage.payback": "Payback",
        "proposalPage.flexMessage.installationCost": "Installation Cost",
        "proposalPage.flexMessage.viewProposal": "View Proposal",
        "proposalPage.flexMessage.years": "years",

        # resultsPage
        "resultsPage.title": "Analysis Results",
        "resultsPage.loading": "Loading results...",
        "resultsPage.system.title": "System Information",
        "resultsPage.system.systemSize": "System Size",
        "resultsPage.system.panels": "Panels",
        "resultsPage.system.panelsCount": "{count} panels",
        "resultsPage.system.yearlyEnergy": "Yearly Energy",
        "resultsPage.system.kwhPerYear": "kWh/year",
        "resultsPage.roi.title": "Return on Investment",
        "resultsPage.roi.estimatedCost": "Estimated Cost",
        "resultsPage.roi.monthlySavings": "Monthly Savings",
        "resultsPage.roi.yearlySavings": "Yearly Savings",
        "resultsPage.roi.paybackPeriod": "Payback Period",
        "resultsPage.roi.savings25Years": "25-Year Savings",
        "resultsPage.roi.years": "years",
        "resultsPage.carbon.title": "Environmental Impact",
        "resultsPage.carbon.tonsPerYear": "tons CO2/year",
        "resultsPage.carbon.equivalentTrees": "Equivalent Trees",
        "resultsPage.carbon.treesDescription": "equivalent trees planted per year",
        "resultsPage.actions.downloadPdf": "Download PDF",
        "resultsPage.actions.generatingPdf": "Generating PDF...",
        "resultsPage.actions.shareResults": "Share Results",
        "resultsPage.actions.sharing": "Sharing...",
        "resultsPage.errors.loadError": "Failed to load results",
        "resultsPage.errors.pdfError": "Failed to generate PDF",
        "resultsPage.errors.shareError": "Failed to share results",
        "resultsPage.empty.title": "No results",
        "resultsPage.empty.description": "No analysis results found",
        "resultsPage.empty.startAnalysis": "Start Analysis",
        "resultsPage.flexMessage.title": "Solar Analysis Results",
        "resultsPage.flexMessage.systemSize": "System Size",
        "resultsPage.flexMessage.panelsCount": "Panels",
        "resultsPage.flexMessage.yearlyEnergy": "Yearly Energy",
        "resultsPage.flexMessage.monthlySavings": "Monthly Savings",
        "resultsPage.flexMessage.payback": "Payback",
        "resultsPage.flexMessage.carbonReduction": "Carbon Reduction",
        "resultsPage.flexMessage.viewDetails": "View Details",
        "resultsPage.flexMessage.years": "years",

        # reviewPage
        "reviewPage.title": "Leave a Review",
        "reviewPage.subtitle": "Share your experience with this installer",
        "reviewPage.form.yourReview": "Your Review",
        "reviewPage.form.placeholder": "Write your review here...",
        "reviewPage.form.rateDimensions": "Rate each aspect",
        "reviewPage.form.addPhoto": "Add Photo",
        "reviewPage.form.submit": "Submit Review",
        "reviewPage.form.allRequired": "All fields are required",
        "reviewPage.form.incomplete": "Please complete all fields",
        "reviewPage.form.minCharacters": "Minimum {count} characters required",
        "reviewPage.states.pleaseWait": "Please wait...",
        "reviewPage.states.submitting": "Submitting your review...",
        "reviewPage.states.success.title": "Thank you for your review!",
        "reviewPage.states.success.description": "Your feedback helps improve service quality",
        "reviewPage.states.success.closeNotice": "This window will close automatically",
        "reviewPage.states.error.title": "Error",
        "reviewPage.states.error.loadError": "Failed to load review form",
        "reviewPage.states.error.submitError": "Failed to submit review",
        "reviewPage.states.alreadyReviewed.title": "Already Reviewed",
        "reviewPage.states.alreadyReviewed.yourReview": "Your Review",
        "reviewPage.states.alreadyReviewed.submittedOn": "Submitted on",
        "reviewPage.states.alreadyReviewed.attachedPhotos": "Attached Photos",

        # quoteBuilderPage
        "quoteBuilderPage.loading": "Loading...",
        "quoteBuilderPage.back": "Back",
        "quoteBuilderPage.clear": "Clear",
        "quoteBuilderPage.createQuote": "Create Quote",
        "quoteBuilderPage.loadTemplate": "Load Template",
        "quoteBuilderPage.usingTemplate": "Using Template",
        "quoteBuilderPage.location": "Location",
        "quoteBuilderPage.systemSize": "System Size",
        "quoteBuilderPage.budget": "Budget",
        "quoteBuilderPage.timeline": "Timeline",
        "quoteBuilderPage.additionalRequirements": "Additional Requirements",
        "quoteBuilderPage.requestDetails": "Request Details",
        "quoteBuilderPage.approximatePrice": "Approximate Price",
        "quoteBuilderPage.notSpecified": "Not specified",
        "quoteBuilderPage.draftSaved": "Draft saved",
        "quoteBuilderPage.draftSaveError": "Failed to save draft",
        "quoteBuilderPage.submitError": "Failed to submit quote",
        "quoteBuilderPage.templates.select": "Select Template",
        "quoteBuilderPage.templates.noTemplates": "No templates available",
        "quoteBuilderPage.validation.fillSystemInfo": "Please fill in system information",
        "quoteBuilderPage.validation.specifyDates": "Please specify dates",
        "quoteBuilderPage.labels.panels": "Panels",
        "quoteBuilderPage.labels.panelProduct": "Panel Product",
        "quoteBuilderPage.labels.panelCount": "Panel Count",
        "quoteBuilderPage.labels.panelPerformance": "Panel Performance",
        "quoteBuilderPage.labels.inverter": "Inverter",
        "quoteBuilderPage.labels.inverterCapacity": "Inverter Capacity",
        "quoteBuilderPage.labels.battery": "Battery",
        "quoteBuilderPage.labels.mounting": "Mounting",
        "quoteBuilderPage.labels.totalSystemSize": "Total System Size",
        "quoteBuilderPage.labels.performance": "Performance",
        "quoteBuilderPage.labels.monthlyProduction": "Monthly Production",
        "quoteBuilderPage.labels.monthlySavings": "Monthly Savings",
        "quoteBuilderPage.labels.paybackPeriod": "Payback Period",
        "quoteBuilderPage.labels.priceDetails": "Price Details",
        "quoteBuilderPage.labels.cashPayment": "Cash Payment",
        "quoteBuilderPage.labels.cashDiscount": "Cash Discount",
        "quoteBuilderPage.labels.financing": "Financing",
        "quoteBuilderPage.labels.warranty": "Warranty",
        "quoteBuilderPage.labels.installationWarranty": "Installation Warranty",
        "quoteBuilderPage.labels.roofLeak": "Roof Leak Warranty",
        "quoteBuilderPage.labels.timeline": "Timeline",
        "quoteBuilderPage.labels.siteSurvey": "Site Survey",
        "quoteBuilderPage.labels.installationStart": "Installation Start",
        "quoteBuilderPage.labels.installationComplete": "Installation Complete",
        "quoteBuilderPage.labels.totalDuration": "Total Duration",

        # quotePreviewPage
        "quotePreviewPage.title": "Quote Preview",
        "quotePreviewPage.edit": "Edit",
        "quotePreviewPage.submit": "Submit Quote",
        "quotePreviewPage.printSave": "Print / Save",
        "quotePreviewPage.backToCreate": "Back to Create",
        "quotePreviewPage.noDataFound": "No data found",
        "quotePreviewPage.panels": "panels",
        "quotePreviewPage.onRoof": "on roof",
        "quotePreviewPage.days": "days",
        "quotePreviewPage.years": "years",
        "quotePreviewPage.sections.systemInfo": "System Information",
        "quotePreviewPage.sections.additionalServices": "Additional Services",
        "quotePreviewPage.submitted.title": "Quote Submitted",
        "quotePreviewPage.submitted.description": "Your quote has been submitted successfully",
        "quotePreviewPage.submitted.goToDeals": "Go to Deals",
        "quotePreviewPage.submitted.viewOtherRequests": "View Other Requests",
        "quotePreviewPage.labels.solarQuote": "Solar Quote",
        "quotePreviewPage.labels.quoteNumber": "Quote Number",
        "quotePreviewPage.labels.date": "Date",
        "quotePreviewPage.labels.quoter": "Quoter",
        "quotePreviewPage.labels.receiver": "Receiver",
        "quotePreviewPage.labels.validUntil": "Valid Until",
        "quotePreviewPage.labels.panelCost": "Panel Cost",
        "quotePreviewPage.labels.inverterCost": "Inverter Cost",
        "quotePreviewPage.labels.batteryCost": "Battery Cost",
        "quotePreviewPage.labels.mountingCost": "Mounting Cost",
        "quotePreviewPage.labels.laborCost": "Labor Cost",
        "quotePreviewPage.labels.engineeringCost": "Engineering Cost",
        "quotePreviewPage.labels.permitCost": "Permit Cost",
        "quotePreviewPage.labels.scaffoldingCost": "Scaffolding Cost",
        "quotePreviewPage.labels.cableAndAccessories": "Cable & Accessories",
        "quotePreviewPage.labels.monitoringSystem": "Monitoring System",
        "quotePreviewPage.labels.subtotal": "Subtotal",
        "quotePreviewPage.labels.discount": "Discount",
        "quotePreviewPage.labels.total": "Total",
        "quotePreviewPage.labels.pricePerKw": "Price per kW",
        "quotePreviewPage.labels.notes": "Notes",
        "quotePreviewPage.labels.optional": "Optional",
        "quotePreviewPage.labels.includedInPackage": "Included in Package",
        "quotePreviewPage.labels.installment": "Installment",
        "quotePreviewPage.labels.interestRate": "Interest Rate",
        "quotePreviewPage.labels.months": "months",
        "quotePreviewPage.labels.signName": "Signature Name",
        "quotePreviewPage.labels.signDate": "Signature Date",

        # quoteBuilder
        "quoteBuilder.step1": "System Info",
        "quoteBuilder.step2": "Pricing",
        "quoteBuilder.step3": "Timeline",
        "quoteBuilder.step4": "Review",
        "quoteBuilder.days": "days",

        # subscriptionCard
        "subscriptionCard.planName": "Plan",
        "subscriptionCard.subtitle": "Your current subscription",
        "subscriptionCard.currentPeriod": "Current Period",
        "subscriptionCard.daysLeft": "days left",
        "subscriptionCard.to": "to",
        "subscriptionCard.endsAtPeriod": "Ends at period",
        "subscriptionCard.cancelledWarning": "Your subscription has been cancelled",
        "subscriptionCard.resume": "Resume Subscription",
        "subscriptionCard.resuming": "Resuming...",

        # trialCountdown
        "trialCountdown.timeLeft": "Time Left",
        "trialCountdown.endingSoon": "Trial Ending Soon",
        "trialCountdown.expired": "Trial Expired",
        "trialCountdown.expiredDesc": "Your trial period has ended",
        "trialCountdown.noCreditCard": "No credit card required",
        "trialCountdown.keepData": "Keep your data",
        "trialCountdown.upgradeCTA": "Upgrade Now",

        # upgradeCTA
        "upgradeCTA.upgradeTitle": "Upgrade Your Plan",
        "upgradeCTA.changeTitle": "Change Plan",
        "upgradeCTA.upgradeCTA": "Upgrade Now",
        "upgradeCTA.viewAllPlans": "View All Plans",
        "upgradeCTA.freeDesc": "Start with our free plan",
        "upgradeCTA.showBillingInfo": "Show Billing Info",
        "upgradeCTA.hideDetails": "Hide Details",
        "upgradeCTA.faqTitle": "Frequently Asked Questions",
        "upgradeCTA.faq1Question": "Can I change plans anytime?",
        "upgradeCTA.faq1Answer": "Yes, you can upgrade or downgrade your plan at any time.",
        "upgradeCTA.faq2Question": "Is there a free trial?",
        "upgradeCTA.faq2Answer": "Yes, all plans include a 14-day free trial.",
        "upgradeCTA.faq3Question": "How do I cancel?",
        "upgradeCTA.faq3Answer": "You can cancel your subscription from the settings page.",
        "upgradeCTA.step1Title": "Choose a Plan",
        "upgradeCTA.step1Desc": "Select the plan that fits your business needs",
        "upgradeCTA.step2Title": "Enter Payment Info",
        "upgradeCTA.step2Desc": "Securely enter your payment details",
        "upgradeCTA.step3Title": "Activate",
        "upgradeCTA.step3Desc": "Start using all premium features immediately",
        "upgradeCTA.step4Title": "Grow",
        "upgradeCTA.step4Desc": "Scale your solar business with powerful tools",
    }

    if full_key in translations:
        return translations[full_key]

    # Fallback: generate from key name
    return generate_en_from_key(key)


def generate_en_from_key(key):
    """Generate English text from a key name using camelCase/dot splitting."""
    # Get the last part of the key
    last_part = key.split(".")[-1]

    # Convert camelCase to words
    words = re.sub(r'([A-Z])', r' \1', last_part).strip()
    words = words.replace("_", " ")

    # Capitalize first letter
    return words[0].upper() + words[1:] if words else last_part


def generate_th_translation(namespace, key, en_text):
    """Generate Thai translation based on namespace, key, and English text."""
    full_key = f"{namespace}.{key}"

    translations = {
        # aboutPage
        "aboutPage.title": "เกี่ยวกับ SolarIQ",
        "aboutPage.subtitle": "แพลตฟอร์มวิเคราะห์พลังงานแสงอาทิตย์อัจฉริยะ",
        "aboutPage.description": "SolarIQ เป็นแพลตฟอร์มอัจฉริยะสำหรับวิเคราะห์ศักยภาพพลังงานแสงอาทิตย์ ช่วยให้คุณตัดสินใจเกี่ยวกับการติดตั้งแผงโซลาร์เซลล์อย่างมีข้อมูล",
        "aboutPage.loading": "กำลังโหลด...",
        "aboutPage.error": "เกิดข้อผิดพลาด",
        "aboutPage.close": "ปิด",
        "aboutPage.copyright": "สงวนลิขสิทธิ์",
        "aboutPage.version": "เวอร์ชัน",
        "aboutPage.contact.title": "ติดต่อเรา",
        "aboutPage.contact.email": "อีเมล",
        "aboutPage.contact.call": "โทร",
        "aboutPage.contact.website": "เว็บไซต์",
        "aboutPage.features.billScanning.title": "สแกนบิลค่าไฟ",
        "aboutPage.features.billScanning.description": "สแกนบิลค่าไฟฟ้าเพื่อคำนวณการประหยัดอัตโนมัติ",
        "aboutPage.features.billScanning.icon": "receipt",
        "aboutPage.features.carbonFootprint.title": "คาร์บอนฟุตพริ้นท์",
        "aboutPage.features.carbonFootprint.description": "คำนวณการลดคาร์บอนจากพลังงานแสงอาทิตย์",
        "aboutPage.features.carbonFootprint.icon": "leaf",
        "aboutPage.features.locationAnalysis.title": "วิเคราะห์ตามพิกัด",
        "aboutPage.features.locationAnalysis.description": "วิเคราะห์ศักยภาพพลังงานแสงอาทิตย์ตามตำแหน่งของคุณ",
        "aboutPage.features.locationAnalysis.icon": "map-pin",
        "aboutPage.features.pdfQuote.title": "ใบเสนอราคา PDF",
        "aboutPage.features.pdfQuote.description": "สร้างใบเสนอราคา PDF มืออาชีพสำหรับลูกค้า",
        "aboutPage.features.pdfQuote.icon": "file-text",
        "aboutPage.features.roiCalculation.title": "คำนวณ ROI",
        "aboutPage.features.roiCalculation.description": "คำนวณผลตอบแทนการลงทุนสำหรับการติดตั้งโซลาร์เซลล์",
        "aboutPage.features.roiCalculation.icon": "calculator",
        "aboutPage.stats.title": "สถิติแพลตฟอร์ม",
        "aboutPage.stats.analyses": "การวิเคราะห์ที่เสร็จสิ้น",
        "aboutPage.stats.installations": "การติดตั้ง",
        "aboutPage.stats.savings": "ยอดประหยัดรวม",

        # contactPage
        "contactPage.title": "ข้อมูลติดต่อ",
        "contactPage.description": "กรุณากรอกข้อมูลติดต่อของคุณ",
        "contactPage.loading": "กำลังโหลด...",
        "contactPage.pdpaNotice": "ข้อมูลของคุณได้รับการคุ้มครองภายใต้ พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล (PDPA)",
        "contactPage.success.title": "บันทึกข้อมูลสำเร็จ",
        "contactPage.success.redirecting": "กำลังเปลี่ยนหน้า...",
        "contactPage.form.name": "ชื่อ-นามสกุล",
        "contactPage.form.nameRequired": "กรุณากรอกชื่อ",
        "contactPage.form.email": "อีเมล",
        "contactPage.form.emailInvalid": "รูปแบบอีเมลไม่ถูกต้อง",
        "contactPage.form.phone": "เบอร์โทรศัพท์",
        "contactPage.form.phoneRequired": "กรุณากรอกเบอร์โทรศัพท์",
        "contactPage.form.phoneInvalid": "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง",
        "contactPage.form.address": "ที่อยู่",
        "contactPage.form.addressPlaceholder": "กรอกที่อยู่ของคุณ",
        "contactPage.form.district": "เขต/อำเภอ",
        "contactPage.form.districtPlaceholder": "กรอกเขต/อำเภอ",
        "contactPage.form.province": "จังหวัด",
        "contactPage.form.selectProvince": "เลือกจังหวัด",
        "contactPage.form.save": "บันทึก",
        "contactPage.form.saving": "กำลังบันทึก...",
        "contactPage.form.update": "อัปเดต",

        # knowledge
        "knowledge.title": "คลังความรู้",
        "knowledge.description": "จัดการเอกสารและข้อมูลสำหรับ AI",
        "knowledge.documents.title": "เอกสาร",
        "knowledge.documents.titleColumn": "ชื่อ",
        "knowledge.documents.sourceColumn": "แหล่งที่มา",
        "knowledge.documents.chunksColumn": "ส่วนย่อย",
        "knowledge.documents.updatedColumn": "อัปเดตล่าสุด",
        "knowledge.documents.actionsColumn": "การดำเนินการ",
        "knowledge.documents.delete": "ลบ",
        "knowledge.errors.contentRequired": "กรุณากรอกเนื้อหา",
        "knowledge.messages.confirmDelete": "คุณแน่ใจหรือไม่ที่จะลบเอกสารนี้?",
        "knowledge.search.button": "ค้นหา",
        "knowledge.search.clear": "ล้าง",
        "knowledge.search.placeholder": "ค้นหาเอกสาร...",
        "knowledge.search.results": "ผลการค้นหา",
        "knowledge.search.score": "คะแนนความเกี่ยวข้อง",
        "knowledge.stats.sources": "แหล่งข้อมูล",
        "knowledge.stats.totalChunks": "จำนวนส่วนย่อยทั้งหมด",
        "knowledge.stats.totalDocuments": "จำนวนเอกสารทั้งหมด",
        "knowledge.upload.button": "อัปโหลดเอกสาร",
        "knowledge.upload.cancel": "ยกเลิก",
        "knowledge.upload.contentLabel": "เนื้อหา",
        "knowledge.upload.contentPlaceholder": "กรอกเนื้อหาเอกสาร...",
        "knowledge.upload.metadataLabel": "เมตาดาต้า",
        "knowledge.upload.metadataOptional": "(ไม่บังคับ)",
        "knowledge.upload.metadataPlaceholder": "กรอกเมตาดาต้าในรูปแบบ JSON...",
        "knowledge.upload.modalTitle": "อัปโหลดเอกสารใหม่",
        "knowledge.upload.sourceLabel": "แหล่งที่มา",
        "knowledge.upload.submit": "ส่ง",
        "knowledge.upload.titleLabel": "ชื่อเอกสาร",
        "knowledge.upload.titlePlaceholder": "กรอกชื่อเอกสาร...",

        # analyzePage
        "analyzePage.title": "วิเคราะห์พลังงานแสงอาทิตย์",
        "analyzePage.subtitle": "วิเคราะห์ศักยภาพพลังงานแสงอาทิตย์สำหรับพื้นที่ของคุณ",
        "analyzePage.analyzeButton": "วิเคราะห์",
        "analyzePage.analyzeHint": "กรอกข้อมูลตำแหน่งและค่าไฟเพื่อเริ่มการวิเคราะห์",
        "analyzePage.inputForm.title": "ข้อมูลนำเข้า",
        "analyzePage.inputForm.address": "ที่อยู่",
        "analyzePage.inputForm.addressPlaceholder": "กรอกที่อยู่หรือตำแหน่ง",
        "analyzePage.inputForm.latitude": "ละติจูด",
        "analyzePage.inputForm.latitudeHint": "เช่น 13.7563",
        "analyzePage.inputForm.longitude": "ลองจิจูด",
        "analyzePage.inputForm.longitudeHint": "เช่น 100.5018",
        "analyzePage.inputForm.monthlyBill": "ค่าไฟฟ้ารายเดือน",
        "analyzePage.inputForm.monthlyBillHint": "ค่าไฟฟ้าเฉลี่ยต่อเดือน (บาท)",
        "analyzePage.inputForm.useCurrentLocation": "ใช้ตำแหน่งปัจจุบัน",
        "analyzePage.inputForm.useDefaultLocation": "ใช้ตำแหน่งเริ่มต้น",
        "analyzePage.locationPreview.title": "ตัวอย่างตำแหน่ง",
        "analyzePage.locationPreview.subtitle": "ศักยภาพพลังงานแสงอาทิตย์สำหรับตำแหน่งที่เลือก",
        "analyzePage.locationPreview.coordinates": "พิกัด",
        "analyzePage.locationPreview.region": "ภูมิภาค",
        "analyzePage.locationPreview.regionNorth": "ภาคเหนือ",
        "analyzePage.locationPreview.regionCentral": "ภาคกลาง",
        "analyzePage.locationPreview.regionSouth": "ภาคใต้",
        "analyzePage.locationPreview.avgSolarPotential": "ศักยภาพพลังงานแสงอาทิตย์เฉลี่ย",
        "analyzePage.locationPreview.hoursPerYear": "ชั่วโมงแสงอาทิตย์สูงสุด/ปี",
        "analyzePage.locationPreview.reliabilityIndex": "ดัชนีความน่าเชื่อถือ",
        "analyzePage.locationPreview.forecast7day": "พยากรณ์ 7 วัน",
        "analyzePage.locationPreview.pm25impact": "ผลกระทบ PM2.5",
        "analyzePage.locationPreview.financingComparison": "เปรียบเทียบการเงิน",
        "analyzePage.locationPreview.investment25yr": "การลงทุน 25 ปี",
        "analyzePage.locationPreview.roofPlan": "แผนผังหลังคา",
        "analyzePage.locationPreview.youWillReceive": "คุณจะได้รับ",
        "analyzePage.messages.fillAllFields": "กรุณากรอกข้อมูลให้ครบทุกช่อง",
        "analyzePage.messages.invalidBill": "กรุณากรอกจำนวนค่าไฟที่ถูกต้อง",
        "analyzePage.messages.invalidLatitude": "กรุณากรอกละติจูดที่ถูกต้อง",
        "analyzePage.messages.invalidLongitude": "กรุณากรอกลองจิจูดที่ถูกต้อง",
        "analyzePage.messages.locationSuccess": "ได้รับตำแหน่งสำเร็จ",
        "analyzePage.messages.locationFailed": "ไม่สามารถรับตำแหน่งได้",
        "analyzePage.messages.geolocationNotSupported": "เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง",
        "analyzePage.messages.analysisSuccess": "วิเคราะห์เสร็จสมบูรณ์",
        "analyzePage.messages.analysisFailed": "การวิเคราะห์ล้มเหลว กรุณาลองใหม่อีกครั้ง",
        "analyzePage.results.title": "ผลการวิเคราะห์",
        "analyzePage.tabs.overview": "ภาพรวม",
        "analyzePage.tabs.solar": "พลังงานแสงอาทิตย์",
        "analyzePage.tabs.financial": "การเงิน",
        "analyzePage.tabs.equipment": "อุปกรณ์",
        "analyzePage.tabs.roof": "หลังคา",
        "analyzePage.tabs.forecast": "พยากรณ์",
        "analyzePage.tabs.reliability": "ความน่าเชื่อถือ",
        "analyzePage.tabs.incentives": "สิทธิประโยชน์",
        "analyzePage.tabs.data": "ข้อมูล",

        # settingsPage
        "settingsPage.loading": "กำลังโหลด...",
        "settingsPage.version": "เวอร์ชัน",
        "settingsPage.contact": "ติดต่อฝ่ายสนับสนุน",
        "settingsPage.account.title": "ข้อมูลบัญชี",
        "settingsPage.account.name": "ชื่อ",
        "settingsPage.account.email": "อีเมล",
        "settingsPage.account.phone": "เบอร์โทรศัพท์",
        "settingsPage.account.status": "สถานะ",
        "settingsPage.account.edit": "แก้ไข",
        "settingsPage.account.addContact": "เพิ่มข้อมูลติดต่อ",
        "settingsPage.account.noContact": "ไม่มีข้อมูลติดต่อ",
        "settingsPage.consent.title": "การจัดการความยินยอม",
        "settingsPage.tax.title": "ข้อมูลภาษี",
        "settingsPage.tax.subtitle": "ข้อมูลภาษีบริษัทสำหรับใบแจ้งหนี้และใบเสร็จ",
        "settingsPage.tax.taxId": "เลขประจำตัวผู้เสียภาษี",
        "settingsPage.tax.branchNumber": "สาขา",
        "settingsPage.tax.companyNameTh": "ชื่อบริษัท (ภาษาไทย)",
        "settingsPage.tax.companyNameEn": "ชื่อบริษัท (ภาษาอังกฤษ)",
        "settingsPage.tax.taxAddress": "ที่อยู่สำหรับออกใบกำกับภาษี",
        "settingsPage.tax.contactPerson": "ผู้ติดต่อ",
        "settingsPage.tax.contactEmail": "อีเมลติดต่อ",
        "settingsPage.tax.contactPhone": "เบอร์โทรติดต่อ",
        "settingsPage.tax.save": "บันทึก",
        "settingsPage.tax.reset": "รีเซ็ต",
        "settingsPage.dangerZone.title": "โซนอันตราย",
        "settingsPage.dangerZone.deleteAll": "ลบข้อมูลทั้งหมด",
        "settingsPage.dangerZone.deleteNotice": "การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลทั้งหมดจะถูกลบอย่างถาวร",
        "settingsPage.dangerZone.deleteConfirm": "คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด?",
        "settingsPage.errors.loadError": "ไม่สามารถโหลดการตั้งค่าได้",
        "settingsPage.errors.deleteError": "ไม่สามารถลบข้อมูลได้",

        # onboardingPage
        "onboardingPage.step3.addMember": "เพิ่มสมาชิกทีม",
        "onboardingPage.step3.memberNumber": "สมาชิกคนที่ {number}",
        "onboardingPage.step3.noMembers": "ยังไม่มีสมาชิกทีม",
        "onboardingPage.step3.roleAdmin": "ผู้ดูแลระบบ",
        "onboardingPage.step3.roleMember": "สมาชิก",
        "onboardingPage.step3.sendInvites": "ส่งคำเชิญ",
        "onboardingPage.step3.sendingInvites": "กำลังส่งคำเชิญ...",
        "onboardingPage.step3.skip": "ข้าม",
        "onboardingPage.step4.baht": "บาท",
        "onboardingPage.step4.createLead": "สร้างลีด",
        "onboardingPage.step4.creatingLead": "กำลังสร้างลีด...",
        "onboardingPage.step4.customerName": "ชื่อลูกค้า",
        "onboardingPage.step4.infoMessage": "สร้างลีดแรกของคุณเพื่อเริ่มต้น",
        "onboardingPage.step4.monthlyBill": "ค่าไฟฟ้ารายเดือน",
        "onboardingPage.step4.phone": "เบอร์โทรศัพท์",
        "onboardingPage.step4.province": "จังหวัด",
        "onboardingPage.step4.selectProvince": "เลือกจังหวัด",
        "onboardingPage.step5.company": "บริษัท",
        "onboardingPage.step5.goToDashboard": "ไปที่แดชบอร์ด",
        "onboardingPage.step5.leadCreated": "สร้างลีดแล้ว",
        "onboardingPage.step5.leadLabel": "ลีดแรก",
        "onboardingPage.step5.leadNotCreated": "ยังไม่ได้สร้างลีด",
        "onboardingPage.step5.lineConnected": "เชื่อมต่อ LINE แล้ว",
        "onboardingPage.step5.lineLabel": "การเชื่อมต่อ LINE",
        "onboardingPage.step5.lineNotConnected": "ยังไม่ได้เชื่อมต่อ LINE",
        "onboardingPage.step5.preparingDashboard": "กำลังเตรียมแดชบอร์ดของคุณ...",
        "onboardingPage.step5.setupSummary": "สรุปการตั้งค่า",
        "onboardingPage.step5.skipped": "ข้ามแล้ว",
        "onboardingPage.step5.teamInvited": "เชิญทีมแล้ว",
        "onboardingPage.step5.teamLabel": "ทีม",
        "onboardingPage.step5.teamNotInvited": "ยังไม่ได้เชิญทีม",

        # addActivityModal
        "addActivityModal.addActivity": "เพิ่มกิจกรรม",
        "addActivityModal.subtitle": "เลือกวันที่เพื่อเพิ่มหรือดูกิจกรรม",
        "addActivityModal.selectDatePrompt": "เลือกวันที่",
        "addActivityModal.noEventsToday": "ไม่มีกิจกรรมวันนี้",
        "addActivityModal.overdue": "เลยกำหนด",
        "addActivityModal.upcomingEvents": "กิจกรรมที่กำลังจะมาถึง",
        "addActivityModal.eventsForDate": "กิจกรรมสำหรับวันนี้",
        "addActivityModal.daysShort.mon": "จ.",
        "addActivityModal.daysShort.tue": "อ.",
        "addActivityModal.daysShort.wed": "พ.",
        "addActivityModal.daysShort.thu": "พฤ.",
        "addActivityModal.daysShort.fri": "ศ.",
        "addActivityModal.daysShort.sat": "ส.",
        "addActivityModal.daysShort.sun": "อา.",
        "addActivityModal.months.january": "มกราคม",
        "addActivityModal.months.february": "กุมภาพันธ์",
        "addActivityModal.months.march": "มีนาคม",
        "addActivityModal.months.april": "เมษายน",
        "addActivityModal.months.may": "พฤษภาคม",
        "addActivityModal.months.june": "มิถุนายน",
        "addActivityModal.months.july": "กรกฎาคม",
        "addActivityModal.months.august": "สิงหาคม",
        "addActivityModal.months.september": "กันยายน",
        "addActivityModal.months.october": "ตุลาคม",
        "addActivityModal.months.november": "พฤศจิกายน",
        "addActivityModal.months.december": "ธันวาคม",
        "addActivityModal.eventTypes.installation": "การติดตั้ง",
        "addActivityModal.eventTypes.maintenance": "บำรุงรักษา",
        "addActivityModal.eventTypes.service_request": "คำขอบริการ",

        # analytics.funnel
        "analytics.funnel.title": "ช่องทางการขาย",
        "analytics.funnel.subtitle": "ติดตามประสิทธิภาพท่อการขายของคุณ",
        "analytics.funnel.funnelTitle": "ช่องทางการแปลง",
        "analytics.funnel.conversion": "อัตราการแปลง",
        "analytics.funnel.dropOff": "อัตราการหลุด",
        "analytics.funnel.overallConversion": "อัตราการแปลงรวม",
        "analytics.funnel.totalRevenue": "รายได้รวม",
        "analytics.funnel.avgTimeToPurchase": "เวลาเฉลี่ยในการซื้อ",
        "analytics.funnel.insights": "ข้อมูลเชิงลึก",
        "analytics.funnel.insight1Title": "คุณภาพลีด",
        "analytics.funnel.insight1Desc": "มุ่งเน้นลีดคุณภาพสูงเพื่ออัตราการแปลงที่ดีขึ้น",
        "analytics.funnel.insight2Title": "ความเร็วในการติดตาม",
        "analytics.funnel.insight2Desc": "การติดตามที่รวดเร็วช่วยเพิ่มโอกาสการแปลง",
        "analytics.funnel.insight3Title": "การเพิ่มประสิทธิภาพใบเสนอราคา",
        "analytics.funnel.insight3Desc": "ปรับปรุงราคาใบเสนอราคาเพื่อเพิ่มอัตราการชนะ",
        "analytics.funnel.insight4Title": "การรักษาลูกค้า",
        "analytics.funnel.insight4Desc": "รักษาความสัมพันธ์เพื่อการแนะนำและธุรกิจซ้ำ",
        "analytics.funnel.export": "ส่งออก",
        "analytics.funnel.refresh": "รีเฟรช",

        # calendarPage
        "calendarPage.add": "เพิ่ม",
        "calendarPage.adding": "กำลังเพิ่ม...",
        "calendarPage.cancel": "ยกเลิก",
        "calendarPage.error": "เกิดข้อผิดพลาด",
        "calendarPage.fields.activityName": "ชื่อกิจกรรม",
        "calendarPage.fields.customerName": "ชื่อลูกค้า",
        "calendarPage.fields.date": "วันที่",
        "calendarPage.fields.notes": "หมายเหตุ",
        "calendarPage.fields.time": "เวลา",
        "calendarPage.fields.type": "ประเภท",

        # chat
        "chat.conversationClosed": "การสนทนานี้ถูกปิดแล้ว",
        "chat.loadMore": "โหลดเพิ่มเติม",
        "chat.quickReplies": "ตอบกลับด่วน",
        "chat.statusActive": "ใช้งานอยู่",
        "chat.statusClosed": "ปิดแล้ว",
        "chat.system": "ระบบ",
        "chat.you": "คุณ",

        # chatPage
        "chatPage.title": "แชท",
        "chatPage.underDevelopment": "ฟีเจอร์นี้กำลังอยู่ในระหว่างการพัฒนา",

        # consentPage
        "consentPage.title": "การจัดการความยินยอม",
        "consentPage.description": "จัดการการยินยอมข้อมูลส่วนบุคคลของคุณ",
        "consentPage.loading": "กำลังโหลด...",
        "consentPage.pdpaNotice": "ภายใต้ พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล (PDPA) คุณมีสิทธิ์ในการจัดการความยินยอมข้อมูลส่วนบุคคล",
        "consentPage.dataRightsLink": "ดูสิทธิ์ข้อมูลของคุณ",
        "consentPage.actions.save": "บันทึกการตั้งค่า",
        "consentPage.actions.skip": "ข้าม",
        "consentPage.actions.submitting": "กำลังบันทึก...",
        "consentPage.consents.grantedAt": "ให้ความยินยอมเมื่อ",
        "consentPage.dpoContact.title": "เจ้าหน้าที่คุ้มครองข้อมูล",
        "consentPage.dpoContact.email": "อีเมล",
        "consentPage.dpoContact.phone": "โทรศัพท์",
        "consentPage.errors.general": "เกิดข้อผิดพลาด",
        "consentPage.errors.save": "ไม่สามารถบันทึกการตั้งค่าความยินยอมได้",
        "consentPage.rights.title": "สิทธิ์ของคุณ",
        "consentPage.rights.description": "คุณมีสิทธิ์ในการเข้าถึง แก้ไข และลบข้อมูลส่วนบุคคลของคุณ",
        "consentPage.success.title": "บันทึกการตั้งค่าสำเร็จ",
        "consentPage.success.redirecting": "กำลังเปลี่ยนหน้า...",
        "consentPage.types.analysisResults.label": "ผลการวิเคราะห์",
        "consentPage.types.analysisResults.description": "แชร์ผลการวิเคราะห์โซลาร์กับผู้ติดตั้ง",
        "consentPage.types.analysisResults.icon": "chart",
        "consentPage.types.contactSharing.label": "การแชร์ข้อมูลติดต่อ",
        "consentPage.types.contactSharing.description": "แชร์ข้อมูลติดต่อของคุณกับผู้ติดตั้งโซลาร์",
        "consentPage.types.contactSharing.icon": "users",
        "consentPage.types.marketing.label": "การตลาด",
        "consentPage.types.marketing.description": "รับข้อเสนอโปรโมชันและข่าวสารอัปเดต",
        "consentPage.types.marketing.icon": "mail",
        "consentPage.types.proposalSharing.label": "การแชร์ใบเสนอราคา",
        "consentPage.types.proposalSharing.description": "แชร์ใบเสนอราคากับฝ่ายที่เกี่ยวข้อง",
        "consentPage.types.proposalSharing.icon": "file",

        # dataRightsPage
        "dataRightsPage.title": "สิทธิ์ข้อมูลของคุณ",
        "dataRightsPage.loading": "กำลังโหลด...",
        "dataRightsPage.pdpaReference": "สิทธิ์ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล มาตรา 30-36",
        "dataRightsPage.deleteSuccess": "ลบข้อมูลสำเร็จ",
        "dataRightsPage.actions.title": "การดำเนินการ",
        "dataRightsPage.actions.download": "ดาวน์โหลดข้อมูลของฉัน",
        "dataRightsPage.actions.downloading": "กำลังดาวน์โหลด...",
        "dataRightsPage.actions.edit": "แก้ไขข้อมูลของฉัน",
        "dataRightsPage.actions.delete": "ลบข้อมูลของฉัน",
        "dataRightsPage.actions.withdraw": "ถอนความยินยอม",
        "dataRightsPage.dataSummary.title": "สรุปข้อมูล",
        "dataRightsPage.dataSummary.name": "ชื่อ",
        "dataRightsPage.dataSummary.email": "อีเมล",
        "dataRightsPage.dataSummary.phone": "เบอร์โทรศัพท์",
        "dataRightsPage.dataSummary.address": "ที่อยู่",
        "dataRightsPage.dataSummary.province": "จังหวัด",
        "dataRightsPage.dataSummary.analysisHistory": "ประวัติการวิเคราะห์",
        "dataRightsPage.dataSummary.consentHistory": "ประวัติความยินยอม",
        "dataRightsPage.deleteModal.title": "ลบข้อมูลทั้งหมด",
        "dataRightsPage.deleteModal.description": "การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลส่วนบุคคลทั้งหมดจะถูกลบอย่างถาวร",
        "dataRightsPage.deleteModal.confirm": "ลบ",
        "dataRightsPage.deleteModal.cancel": "ยกเลิก",
        "dataRightsPage.deleteModal.submitting": "กำลังลบ...",
        "dataRightsPage.dpoContact.title": "เจ้าหน้าที่คุ้มครองข้อมูล",
        "dataRightsPage.dpoContact.email": "อีเมล",
        "dataRightsPage.dpoContact.phone": "โทรศัพท์",

        # createDealModal
        "createDealModal.all": "ทั้งหมด",
        "createDealModal.createDeal": "สร้างดีล",
        "createDealModal.subtitle": "จัดการท่อดีลของคุณ",
        "createDealModal.totalValue": "มูลค่ารวม",
        "createDealModal.progress": "ความคืบหน้า",
        "createDealModal.steps": "ขั้นตอน",
        "createDealModal.empty.title": "ยังไม่มีดีล",
        "createDealModal.empty.description": "สร้างดีลแรกของคุณเพื่อเริ่มต้น",
        "createDealModal.stats.total": "ทั้งหมด",
        "createDealModal.stats.inProgress": "กำลังดำเนินการ",
        "createDealModal.stats.completed": "เสร็จสิ้น",

        # dealsPage
        "dealsPage.cancel": "ยกเลิก",
        "dealsPage.create": "สร้าง",
        "dealsPage.creating": "กำลังสร้าง...",
        "dealsPage.error": "เกิดข้อผิดพลาด",
        "dealsPage.fields.customerName": "ชื่อลูกค้า",
        "dealsPage.fields.address": "ที่อยู่",
        "dealsPage.fields.systemSize": "ขนาดระบบ (kW)",
        "dealsPage.fields.totalValue": "มูลค่ารวม (บาท)",
        "dealsPage.fields.stage": "ขั้นตอน",
        "dealsPage.fields.notes": "หมายเหตุ",

        # historyPage
        "historyPage.title": "ประวัติการวิเคราะห์",
        "historyPage.subtitle": "ดูผลการวิเคราะห์โซลาร์ก่อนหน้า",
        "historyPage.loading": "กำลังโหลด...",
        "historyPage.error": "ไม่สามารถโหลดประวัติได้",
        "historyPage.retry": "ลองใหม่",
        "historyPage.empty.title": "ไม่มีประวัติการวิเคราะห์",
        "historyPage.empty.description": "คุณยังไม่ได้ทำการวิเคราะห์โซลาร์",
        "historyPage.empty.startAnalysis": "เริ่มวิเคราะห์",
        "historyPage.item.panels": "แผง",
        "historyPage.item.payback": "คืนทุน",
        "historyPage.item.years": "ปี",
        "historyPage.item.addressNotSpecified": "ไม่ได้ระบุที่อยู่",

        # invoicesPage
        "invoicesPage.empty": "ไม่พบใบแจ้งหนี้",
        "invoicesPage.history.title": "ประวัติใบแจ้งหนี้",
        "invoicesPage.history.subtitle": "ดูประวัติการเรียกเก็บเงิน",
        "invoicesPage.table.documentNumber": "เลขที่เอกสาร",
        "invoicesPage.table.documentType": "ประเภทเอกสาร",
        "invoicesPage.table.issuedDate": "วันที่ออก",
        "invoicesPage.table.status": "สถานะ",
        "invoicesPage.table.total": "ยอดรวม",
        "invoicesPage.table.action": "การดำเนินการ",

        # maintenanceDetailPage
        "maintenanceDetailPage.title": "รายละเอียดการบำรุงรักษา",
        "maintenanceDetailPage.addressNotSpecified": "ไม่ได้ระบุที่อยู่",
        "maintenanceDetailPage.notFound": "ไม่พบระบบ",
        "maintenanceDetailPage.status.active": "ใช้งานอยู่",
        "maintenanceDetailPage.systemInfo.systemSize": "ขนาดระบบ",
        "maintenanceDetailPage.systemInfo.solarPanels": "แผงโซลาร์เซลล์",
        "maintenanceDetailPage.systemInfo.inverter": "อินเวอร์เตอร์",
        "maintenanceDetailPage.systemInfo.installationDate": "วันที่ติดตั้ง",
        "maintenanceDetailPage.warranty.panel": "ประกันแผงโซลาร์",
        "maintenanceDetailPage.warranty.inverter": "ประกันอินเวอร์เตอร์",
        "maintenanceDetailPage.warranty.installation": "ประกันการติดตั้ง",
        "maintenanceDetailPage.records.title": "บันทึกการบำรุงรักษา",
        "maintenanceDetailPage.records.addRecord": "เพิ่มบันทึก",
        "maintenanceDetailPage.records.noRecords": "ไม่มีบันทึกการบำรุงรักษา",
        "maintenanceDetailPage.records.save": "บันทึก",
        "maintenanceDetailPage.records.costLabel": "ค่าใช้จ่าย (บาท)",
        "maintenanceDetailPage.records.costPlaceholder": "กรอกค่าใช้จ่าย",
        "maintenanceDetailPage.records.technicianLabel": "ช่างเทคนิค",
        "maintenanceDetailPage.records.technicianPlaceholder": "กรอกชื่อช่างเทคนิค",
        "maintenanceDetailPage.records.descriptionPlaceholder": "กรอกรายละเอียด",
        "maintenanceDetailPage.records.type.cleaning": "ทำความสะอาด",
        "maintenanceDetailPage.records.type.inspection": "ตรวจสอบ",
        "maintenanceDetailPage.records.type.repair": "ซ่อมแซม",
        "maintenanceDetailPage.records.type.replacement": "เปลี่ยนอุปกรณ์",
        "maintenanceDetailPage.schedule.title": "ตารางการบำรุงรักษา",
        "maintenanceDetailPage.schedule.addSchedule": "เพิ่มตาราง",
        "maintenanceDetailPage.schedule.noSchedule": "ไม่มีตารางที่กำหนด",
        "maintenanceDetailPage.schedule.nextDue": "ครั้งถัดไป",
        "maintenanceDetailPage.schedule.notSet": "ยังไม่ได้กำหนด",
        "maintenanceDetailPage.schedule.everyXMonths": "ทุก {count} เดือน",
        "maintenanceDetailPage.schedule.notes": "หมายเหตุ",
        "maintenanceDetailPage.schedule.save": "บันทึก",
        "maintenanceDetailPage.schedule.frequency.3": "ทุก 3 เดือน",
        "maintenanceDetailPage.schedule.frequency.6": "ทุก 6 เดือน",
        "maintenanceDetailPage.schedule.frequency.12": "ทุก 12 เดือน",
        "maintenanceDetailPage.schedule.type.cleaning": "ทำความสะอาด",
        "maintenanceDetailPage.schedule.type.inspection": "ตรวจสอบ",
        "maintenanceDetailPage.schedule.type.general": "ทั่วไป",
        "maintenanceDetailPage.schedule.type.inverterCheck": "ตรวจอินเวอร์เตอร์",

        # mapPickerPage
        "mapPickerPage.title": "เลือกตำแหน่ง",
        "mapPickerPage.subtitle": "แตะบนแผนที่เพื่อเลือกตำแหน่งของคุณ",
        "mapPickerPage.address": "ที่อยู่",
        "mapPickerPage.loading": "กำลังโหลดแผนที่...",
        "mapPickerPage.confirm": "ยืนยันตำแหน่ง",
        "mapPickerPage.confirming": "กำลังยืนยัน...",
        "mapPickerPage.selectOnMap": "เลือกบนแผนที่",
        "mapPickerPage.myHomeLocation": "ตำแหน่งบ้านของฉัน",
        "mapPickerPage.pleaseSelectLocation": "กรุณาเลือกตำแหน่งบนแผนที่",
        "mapPickerPage.checkInternetConnection": "กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
        "mapPickerPage.errors.geocodeError": "ไม่สามารถรับที่อยู่จากตำแหน่งได้",
        "mapPickerPage.errors.locationError": "ไม่สามารถรับตำแหน่งของคุณได้",
        "mapPickerPage.errors.submitError": "ไม่สามารถส่งตำแหน่งได้",

        # proposalPage
        "proposalPage.title": "ใบเสนอราคาโซลาร์",
        "proposalPage.subtitle": "ตรวจสอบใบเสนอราคาการติดตั้งโซลาร์ของคุณ",
        "proposalPage.loading": "กำลังโหลดใบเสนอราคา...",
        "proposalPage.document.title": "เอกสารใบเสนอราคา",
        "proposalPage.document.openFullPdf": "เปิด PDF ฉบับเต็ม",
        "proposalPage.summary.title": "สรุประบบ",
        "proposalPage.summary.systemSize": "ขนาดระบบ",
        "proposalPage.summary.yearlyEnergy": "พลังงานรายปี",
        "proposalPage.summary.estimatedPrice": "ราคาประมาณ",
        "proposalPage.roi.title": "ผลตอบแทนการลงทุน",
        "proposalPage.roi.monthlySavings": "ประหยัดรายเดือน",
        "proposalPage.roi.payback": "ระยะเวลาคืนทุน",
        "proposalPage.roi.savings25Years": "ประหยัด 25 ปี",
        "proposalPage.actions.shareToLine": "แชร์ผ่าน LINE",
        "proposalPage.actions.sharing": "กำลังแชร์...",
        "proposalPage.actions.contactInstaller": "ติดต่อผู้ติดตั้ง",
        "proposalPage.status.generating": "กำลังสร้าง",
        "proposalPage.status.generatingDescription": "ใบเสนอราคาของคุณกำลังถูกสร้าง...",
        "proposalPage.status.error": "ข้อผิดพลาด",
        "proposalPage.status.errorDescription": "ไม่สามารถสร้างใบเสนอราคาได้",
        "proposalPage.errors.loadError": "ไม่สามารถโหลดใบเสนอราคาได้",
        "proposalPage.errors.notFound": "ไม่พบใบเสนอราคา",
        "proposalPage.errors.noLeadId": "ไม่พบรหัสลีด",
        "proposalPage.errors.shareError": "ไม่สามารถแชร์ใบเสนอราคาได้",
        "proposalPage.flexMessage.title": "ใบเสนอราคาโซลาร์",
        "proposalPage.flexMessage.systemSize": "ขนาดระบบ",
        "proposalPage.flexMessage.panels": "แผง",
        "proposalPage.flexMessage.monthlySavings": "ประหยัดรายเดือน",
        "proposalPage.flexMessage.payback": "คืนทุน",
        "proposalPage.flexMessage.installationCost": "ค่าติดตั้ง",
        "proposalPage.flexMessage.viewProposal": "ดูใบเสนอราคา",
        "proposalPage.flexMessage.years": "ปี",

        # resultsPage
        "resultsPage.title": "ผลการวิเคราะห์",
        "resultsPage.loading": "กำลังโหลดผลลัพธ์...",
        "resultsPage.system.title": "ข้อมูลระบบ",
        "resultsPage.system.systemSize": "ขนาดระบบ",
        "resultsPage.system.panels": "แผง",
        "resultsPage.system.panelsCount": "{count} แผง",
        "resultsPage.system.yearlyEnergy": "พลังงานรายปี",
        "resultsPage.system.kwhPerYear": "kWh/ปี",
        "resultsPage.roi.title": "ผลตอบแทนการลงทุน",
        "resultsPage.roi.estimatedCost": "ค่าใช้จ่ายประมาณ",
        "resultsPage.roi.monthlySavings": "ประหยัดรายเดือน",
        "resultsPage.roi.yearlySavings": "ประหยัดรายปี",
        "resultsPage.roi.paybackPeriod": "ระยะเวลาคืนทุน",
        "resultsPage.roi.savings25Years": "ประหยัด 25 ปี",
        "resultsPage.roi.years": "ปี",
        "resultsPage.carbon.title": "ผลกระทบต่อสิ่งแวดล้อม",
        "resultsPage.carbon.tonsPerYear": "ตัน CO2/ปี",
        "resultsPage.carbon.equivalentTrees": "ต้นไม้เทียบเท่า",
        "resultsPage.carbon.treesDescription": "ต้นไม้เทียบเท่าที่ปลูกต่อปี",
        "resultsPage.actions.downloadPdf": "ดาวน์โหลด PDF",
        "resultsPage.actions.generatingPdf": "กำลังสร้าง PDF...",
        "resultsPage.actions.shareResults": "แชร์ผลลัพธ์",
        "resultsPage.actions.sharing": "กำลังแชร์...",
        "resultsPage.errors.loadError": "ไม่สามารถโหลดผลลัพธ์ได้",
        "resultsPage.errors.pdfError": "ไม่สามารถสร้าง PDF ได้",
        "resultsPage.errors.shareError": "ไม่สามารถแชร์ผลลัพธ์ได้",
        "resultsPage.empty.title": "ไม่มีผลลัพธ์",
        "resultsPage.empty.description": "ไม่พบผลการวิเคราะห์",
        "resultsPage.empty.startAnalysis": "เริ่มวิเคราะห์",
        "resultsPage.flexMessage.title": "ผลการวิเคราะห์โซลาร์",
        "resultsPage.flexMessage.systemSize": "ขนาดระบบ",
        "resultsPage.flexMessage.panelsCount": "แผง",
        "resultsPage.flexMessage.yearlyEnergy": "พลังงานรายปี",
        "resultsPage.flexMessage.monthlySavings": "ประหยัดรายเดือน",
        "resultsPage.flexMessage.payback": "คืนทุน",
        "resultsPage.flexMessage.carbonReduction": "ลดคาร์บอน",
        "resultsPage.flexMessage.viewDetails": "ดูรายละเอียด",
        "resultsPage.flexMessage.years": "ปี",

        # reviewPage
        "reviewPage.title": "เขียนรีวิว",
        "reviewPage.subtitle": "แชร์ประสบการณ์ของคุณกับผู้ติดตั้ง",
        "reviewPage.form.yourReview": "รีวิวของคุณ",
        "reviewPage.form.placeholder": "เขียนรีวิวของคุณที่นี่...",
        "reviewPage.form.rateDimensions": "ให้คะแนนแต่ละด้าน",
        "reviewPage.form.addPhoto": "เพิ่มรูปภาพ",
        "reviewPage.form.submit": "ส่งรีวิว",
        "reviewPage.form.allRequired": "กรุณากรอกข้อมูลให้ครบทุกช่อง",
        "reviewPage.form.incomplete": "กรุณากรอกข้อมูลให้ครบถ้วน",
        "reviewPage.form.minCharacters": "ต้องมีอย่างน้อย {count} ตัวอักษร",
        "reviewPage.states.pleaseWait": "กรุณารอสักครู่...",
        "reviewPage.states.submitting": "กำลังส่งรีวิวของคุณ...",
        "reviewPage.states.success.title": "ขอบคุณสำหรับรีวิว!",
        "reviewPage.states.success.description": "ความคิดเห็นของคุณช่วยปรับปรุงคุณภาพบริการ",
        "reviewPage.states.success.closeNotice": "หน้าต่างนี้จะปิดอัตโนมัติ",
        "reviewPage.states.error.title": "ข้อผิดพลาด",
        "reviewPage.states.error.loadError": "ไม่สามารถโหลดแบบฟอร์มรีวิวได้",
        "reviewPage.states.error.submitError": "ไม่สามารถส่งรีวิวได้",
        "reviewPage.states.alreadyReviewed.title": "รีวิวแล้ว",
        "reviewPage.states.alreadyReviewed.yourReview": "รีวิวของคุณ",
        "reviewPage.states.alreadyReviewed.submittedOn": "ส่งเมื่อ",
        "reviewPage.states.alreadyReviewed.attachedPhotos": "รูปภาพที่แนบ",

        # quoteBuilderPage
        "quoteBuilderPage.loading": "กำลังโหลด...",
        "quoteBuilderPage.back": "กลับ",
        "quoteBuilderPage.clear": "ล้าง",
        "quoteBuilderPage.createQuote": "สร้างใบเสนอราคา",
        "quoteBuilderPage.loadTemplate": "โหลดเทมเพลต",
        "quoteBuilderPage.usingTemplate": "ใช้เทมเพลต",
        "quoteBuilderPage.location": "ตำแหน่ง",
        "quoteBuilderPage.systemSize": "ขนาดระบบ",
        "quoteBuilderPage.budget": "งบประมาณ",
        "quoteBuilderPage.timeline": "ระยะเวลา",
        "quoteBuilderPage.additionalRequirements": "ข้อกำหนดเพิ่มเติม",
        "quoteBuilderPage.requestDetails": "รายละเอียดคำขอ",
        "quoteBuilderPage.approximatePrice": "ราคาโดยประมาณ",
        "quoteBuilderPage.notSpecified": "ไม่ได้ระบุ",
        "quoteBuilderPage.draftSaved": "บันทึกแบบร่างแล้ว",
        "quoteBuilderPage.draftSaveError": "ไม่สามารถบันทึกแบบร่างได้",
        "quoteBuilderPage.submitError": "ไม่สามารถส่งใบเสนอราคาได้",
        "quoteBuilderPage.templates.select": "เลือกเทมเพลต",
        "quoteBuilderPage.templates.noTemplates": "ไม่มีเทมเพลต",
        "quoteBuilderPage.validation.fillSystemInfo": "กรุณากรอกข้อมูลระบบ",
        "quoteBuilderPage.validation.specifyDates": "กรุณาระบุวันที่",
        "quoteBuilderPage.labels.panels": "แผงโซลาร์",
        "quoteBuilderPage.labels.panelProduct": "รุ่นแผงโซลาร์",
        "quoteBuilderPage.labels.panelCount": "จำนวนแผง",
        "quoteBuilderPage.labels.panelPerformance": "ประสิทธิภาพแผง",
        "quoteBuilderPage.labels.inverter": "อินเวอร์เตอร์",
        "quoteBuilderPage.labels.inverterCapacity": "กำลังอินเวอร์เตอร์",
        "quoteBuilderPage.labels.battery": "แบตเตอรี่",
        "quoteBuilderPage.labels.mounting": "โครงยึด",
        "quoteBuilderPage.labels.totalSystemSize": "ขนาดระบบรวม",
        "quoteBuilderPage.labels.performance": "ประสิทธิภาพ",
        "quoteBuilderPage.labels.monthlyProduction": "ผลิตไฟรายเดือน",
        "quoteBuilderPage.labels.monthlySavings": "ประหยัดรายเดือน",
        "quoteBuilderPage.labels.paybackPeriod": "ระยะเวลาคืนทุน",
        "quoteBuilderPage.labels.priceDetails": "รายละเอียดราคา",
        "quoteBuilderPage.labels.cashPayment": "ชำระเงินสด",
        "quoteBuilderPage.labels.cashDiscount": "ส่วนลดเงินสด",
        "quoteBuilderPage.labels.financing": "ผ่อนชำระ",
        "quoteBuilderPage.labels.warranty": "ประกัน",
        "quoteBuilderPage.labels.installationWarranty": "ประกันการติดตั้ง",
        "quoteBuilderPage.labels.roofLeak": "ประกันหลังคารั่ว",
        "quoteBuilderPage.labels.timeline": "ระยะเวลา",
        "quoteBuilderPage.labels.siteSurvey": "สำรวจหน้างาน",
        "quoteBuilderPage.labels.installationStart": "เริ่มติดตั้ง",
        "quoteBuilderPage.labels.installationComplete": "ติดตั้งเสร็จ",
        "quoteBuilderPage.labels.totalDuration": "ระยะเวลารวม",

        # quotePreviewPage
        "quotePreviewPage.title": "ตัวอย่างใบเสนอราคา",
        "quotePreviewPage.edit": "แก้ไข",
        "quotePreviewPage.submit": "ส่งใบเสนอราคา",
        "quotePreviewPage.printSave": "พิมพ์ / บันทึก",
        "quotePreviewPage.backToCreate": "กลับไปสร้าง",
        "quotePreviewPage.noDataFound": "ไม่พบข้อมูล",
        "quotePreviewPage.panels": "แผง",
        "quotePreviewPage.onRoof": "บนหลังคา",
        "quotePreviewPage.days": "วัน",
        "quotePreviewPage.years": "ปี",
        "quotePreviewPage.sections.systemInfo": "ข้อมูลระบบ",
        "quotePreviewPage.sections.additionalServices": "บริการเพิ่มเติม",
        "quotePreviewPage.submitted.title": "ส่งใบเสนอราคาแล้ว",
        "quotePreviewPage.submitted.description": "ใบเสนอราคาของคุณถูกส่งเรียบร้อยแล้ว",
        "quotePreviewPage.submitted.goToDeals": "ไปที่ดีล",
        "quotePreviewPage.submitted.viewOtherRequests": "ดูคำขออื่นๆ",
        "quotePreviewPage.labels.solarQuote": "ใบเสนอราคาโซลาร์",
        "quotePreviewPage.labels.quoteNumber": "เลขที่ใบเสนอราคา",
        "quotePreviewPage.labels.date": "วันที่",
        "quotePreviewPage.labels.quoter": "ผู้เสนอราคา",
        "quotePreviewPage.labels.receiver": "ผู้รับ",
        "quotePreviewPage.labels.validUntil": "ใช้ได้ถึง",
        "quotePreviewPage.labels.panelCost": "ค่าแผงโซลาร์",
        "quotePreviewPage.labels.inverterCost": "ค่าอินเวอร์เตอร์",
        "quotePreviewPage.labels.batteryCost": "ค่าแบตเตอรี่",
        "quotePreviewPage.labels.mountingCost": "ค่าโครงยึด",
        "quotePreviewPage.labels.laborCost": "ค่าแรง",
        "quotePreviewPage.labels.engineeringCost": "ค่าวิศวกรรม",
        "quotePreviewPage.labels.permitCost": "ค่าใบอนุญาต",
        "quotePreviewPage.labels.scaffoldingCost": "ค่านั่งร้าน",
        "quotePreviewPage.labels.cableAndAccessories": "สายไฟและอุปกรณ์เสริม",
        "quotePreviewPage.labels.monitoringSystem": "ระบบมอนิเตอร์",
        "quotePreviewPage.labels.subtotal": "ยอดรวมย่อย",
        "quotePreviewPage.labels.discount": "ส่วนลด",
        "quotePreviewPage.labels.total": "ยอดรวม",
        "quotePreviewPage.labels.pricePerKw": "ราคาต่อ kW",
        "quotePreviewPage.labels.notes": "หมายเหตุ",
        "quotePreviewPage.labels.optional": "เลือกได้",
        "quotePreviewPage.labels.includedInPackage": "รวมในแพ็กเกจ",
        "quotePreviewPage.labels.installment": "ผ่อนชำระ",
        "quotePreviewPage.labels.interestRate": "อัตราดอกเบี้ย",
        "quotePreviewPage.labels.months": "เดือน",
        "quotePreviewPage.labels.signName": "ชื่อผู้ลงนาม",
        "quotePreviewPage.labels.signDate": "วันที่ลงนาม",

        # quoteBuilder
        "quoteBuilder.step1": "ข้อมูลระบบ",
        "quoteBuilder.step2": "ราคา",
        "quoteBuilder.step3": "ระยะเวลา",
        "quoteBuilder.step4": "ตรวจสอบ",
        "quoteBuilder.days": "วัน",

        # subscriptionCard
        "subscriptionCard.planName": "แพลน",
        "subscriptionCard.subtitle": "แพ็กเกจปัจจุบันของคุณ",
        "subscriptionCard.currentPeriod": "รอบปัจจุบัน",
        "subscriptionCard.daysLeft": "วันที่เหลือ",
        "subscriptionCard.to": "ถึง",
        "subscriptionCard.endsAtPeriod": "สิ้นสุดรอบ",
        "subscriptionCard.cancelledWarning": "แพ็กเกจของคุณถูกยกเลิกแล้ว",
        "subscriptionCard.resume": "เปิดใช้งานแพ็กเกจอีกครั้ง",
        "subscriptionCard.resuming": "กำลังเปิดใช้งาน...",

        # trialCountdown
        "trialCountdown.timeLeft": "เวลาที่เหลือ",
        "trialCountdown.endingSoon": "ทดลองใช้ใกล้หมดอายุ",
        "trialCountdown.expired": "หมดระยะทดลองใช้",
        "trialCountdown.expiredDesc": "ระยะทดลองใช้ของคุณสิ้นสุดแล้ว",
        "trialCountdown.noCreditCard": "ไม่ต้องใช้บัตรเครดิต",
        "trialCountdown.keepData": "เก็บข้อมูลของคุณ",
        "trialCountdown.upgradeCTA": "อัปเกรดเลย",

        # upgradeCTA
        "upgradeCTA.upgradeTitle": "อัปเกรดแพลนของคุณ",
        "upgradeCTA.changeTitle": "เปลี่ยนแพลน",
        "upgradeCTA.upgradeCTA": "อัปเกรดเลย",
        "upgradeCTA.viewAllPlans": "ดูแพลนทั้งหมด",
        "upgradeCTA.freeDesc": "เริ่มต้นด้วยแพลนฟรี",
        "upgradeCTA.showBillingInfo": "แสดงข้อมูลการเรียกเก็บเงิน",
        "upgradeCTA.hideDetails": "ซ่อนรายละเอียด",
        "upgradeCTA.faqTitle": "คำถามที่พบบ่อย",
        "upgradeCTA.faq1Question": "เปลี่ยนแพลนได้ตลอดเวลาหรือไม่?",
        "upgradeCTA.faq1Answer": "ได้ คุณสามารถอัปเกรดหรือดาวน์เกรดแพลนได้ตลอดเวลา",
        "upgradeCTA.faq2Question": "มีช่วงทดลองใช้ฟรีหรือไม่?",
        "upgradeCTA.faq2Answer": "มี ทุกแพลนรวมช่วงทดลองใช้ฟรี 14 วัน",
        "upgradeCTA.faq3Question": "ยกเลิกได้อย่างไร?",
        "upgradeCTA.faq3Answer": "คุณสามารถยกเลิกแพ็กเกจได้จากหน้าตั้งค่า",
        "upgradeCTA.step1Title": "เลือกแพลน",
        "upgradeCTA.step1Desc": "เลือกแพลนที่เหมาะกับธุรกิจของคุณ",
        "upgradeCTA.step2Title": "กรอกข้อมูลการชำระเงิน",
        "upgradeCTA.step2Desc": "กรอกข้อมูลการชำระเงินอย่างปลอดภัย",
        "upgradeCTA.step3Title": "เปิดใช้งาน",
        "upgradeCTA.step3Desc": "เริ่มใช้ฟีเจอร์พรีเมียมทั้งหมดทันที",
        "upgradeCTA.step4Title": "เติบโต",
        "upgradeCTA.step4Desc": "ขยายธุรกิจโซลาร์ด้วยเครื่องมือทรงพลัง",
    }

    if full_key in translations:
        return translations[full_key]

    # Fallback: generate Thai from English and key context
    return generate_th_from_key(key, en_text)


def generate_th_from_key(key, en_text):
    """Generate a reasonable Thai translation from the key name and English text."""
    last_part = key.split(".")[-1]

    # Common Thai translations for common terms
    common_thai = {
        "title": "หัวข้อ",
        "subtitle": "หัวข้อย่อย",
        "description": "รายละเอียด",
        "loading": "กำลังโหลด...",
        "error": "ข้อผิดพลาด",
        "save": "บันทึก",
        "cancel": "ยกเลิก",
        "delete": "ลบ",
        "edit": "แก้ไข",
        "create": "สร้าง",
        "close": "ปิด",
        "confirm": "ยืนยัน",
        "back": "กลับ",
        "next": "ถัดไป",
        "submit": "ส่ง",
        "search": "ค้นหา",
        "clear": "ล้าง",
        "name": "ชื่อ",
        "email": "อีเมล",
        "phone": "เบอร์โทรศัพท์",
        "address": "ที่อยู่",
        "province": "จังหวัด",
        "status": "สถานะ",
        "date": "วันที่",
        "time": "เวลา",
        "type": "ประเภท",
        "notes": "หมายเหตุ",
        "total": "ยอดรวม",
        "action": "การดำเนินการ",
        "version": "เวอร์ชัน",
        "retry": "ลองใหม่",
        "skip": "ข้าม",
        "update": "อัปเดต",
        "download": "ดาวน์โหลด",
        "export": "ส่งออก",
        "refresh": "รีเฟรช",
        "privacy": "ความเป็นส่วนตัว",
        "budget": "งบประมาณ",
        "location": "ตำแหน่ง",
        "active": "ใช้งานอยู่",
        "panels": "แผง",
        "years": "ปี",
        "days": "วัน",
        "months": "เดือน",
    }

    if last_part in common_thai:
        return common_thai[last_part]

    # For other keys, return the English text as-is (better than nothing)
    return en_text


def main():
    print("Loading translation files...")
    th_data = load_json(TH_JSON)
    en_data = load_json(EN_JSON)

    # Collect all (namespace, key) pairs from all tsx files
    all_usages = []
    tsx_files = list(SRC.rglob("*.tsx"))
    print(f"Scanning {len(tsx_files)} .tsx files...")

    for fpath in tsx_files:
        keys_used = scan_file(fpath)
        for ns, key in keys_used:
            all_usages.append((str(fpath), ns, key))

    # Deduplicate namespace.key pairs
    unique_ns_keys = sorted(set((ns, key) for _, ns, key in all_usages))
    print(f"Found {len(unique_ns_keys)} unique namespace.key pairs")

    # Track additions
    added_th = 0
    added_en = 0

    for ns, key in unique_ns_keys:
        full_key = f"{ns}.{key}"

        # Generate translations
        en_text = generate_en_translation(ns, key)
        th_text = generate_th_translation(ns, key, en_text)

        # Check and add to th.json
        ns_data_th = resolve_namespace(th_data, ns)
        if ns_data_th is None:
            ns_data_th = ensure_namespace(th_data, ns)
        if not key_exists(ns_data_th, key):
            set_nested_key(ns_data_th, key, th_text)
            added_th += 1

        # Check and add to en.json
        ns_data_en = resolve_namespace(en_data, ns)
        if ns_data_en is None:
            ns_data_en = ensure_namespace(en_data, ns)
        if not key_exists(ns_data_en, key):
            set_nested_key(ns_data_en, key, en_text)
            added_en += 1

    # Save files
    print(f"\nSaving updated translation files...")
    save_json(TH_JSON, th_data)
    save_json(EN_JSON, en_data)

    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Keys added to th.json: {added_th}")
    print(f"Keys added to en.json: {added_en}")
    print(f"Total unique keys in codebase: {len(unique_ns_keys)}")
    print(f"\nDone! Run 'python find_missing_keys.py' to verify.")


if __name__ == "__main__":
    main()
