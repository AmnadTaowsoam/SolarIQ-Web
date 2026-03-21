import { useState } from 'react';
import { Star, StarHalf, ThumbsUp, Flag } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeDate } from '@/lib/date';
import { useHelpfulVote, useReportReview } from '@/hooks/useReviews';
import type { Review, DimensionScoreResponse } from '@/types/review';
import { REVIEW_DIMENSION_LABELS } from '@/types/review';

interface ReviewCardProps {
  review: Review;
  showActions?: boolean;
  onVoteSuccess?: () => void;
}

// Simple Avatar fallback component
const AvatarFallback: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
    {children}
  </div>
);

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showActions = false,
  onVoteSuccess,
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const { vote, isVoting } = useHelpfulVote();
  const { report, isReporting } = useReportReview();

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<StarHalf key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  const handleHelpfulVote = async (helpful: boolean) => {
    const success = await vote(review.id, helpful);
    if (success && onVoteSuccess) {
      onVoteSuccess();
    }
  };

  const getDimensionLabel = (dimension: string): string => {
    return REVIEW_DIMENSION_LABELS[dimension as keyof typeof REVIEW_DIMENSION_LABELS]?.en || dimension;
  };

  return (
    <Card className="overflow-hidden">
      <CardBody className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <AvatarFallback>
              ?
            </AvatarFallback>
            <div>
              <p className="font-medium text-sm">
                ผู้ใช้ SolarIQ
              </p>
              <p className="text-xs text-gray-500">
                {formatRelativeDate(review.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {renderStars(review.overallRating)}
            <span className="text-sm font-medium ml-1">
              {review.overallRating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Review text */}
        <div className="mb-3">
          {review.title && (
            <h4 className="font-medium text-sm mb-1">{review.title}</h4>
          )}
          <p className="text-sm text-gray-600 line-clamp-3">
            {review.body}
          </p>
        </div>

        {/* Category ratings */}
        {review.dimensions && review.dimensions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {review.dimensions.map((dim: DimensionScoreResponse) => (
              <Badge key={dim.dimension} variant="secondary" className="text-xs">
                {getDimensionLabel(dim.dimension)}: {dim.score}/5
              </Badge>
            ))}
          </div>
        )}

        {/* Contractor Reply */}
        {review.contractorReply && (
          <div className="bg-gray-50 p-3 rounded-lg mb-3">
            <p className="text-xs text-gray-500 mb-1">Contractor Response</p>
            <p className="text-sm text-gray-700">{review.contractorReply}</p>
            {review.contractorReplyAt && (
              <p className="text-xs text-gray-400 mt-1">
                {formatRelativeDate(review.contractorReplyAt)}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4">
            {review.isVerifiedPurchase && (
              <Badge variant="success" className="text-xs">
                ✓ Verified Purchase
              </Badge>
            )}
            <button
              onClick={() => handleHelpfulVote(true)}
              disabled={isVoting || review.userVotedHelpful}
              className={`flex items-center gap-1 text-xs ${
                review.userVotedHelpful
                  ? 'text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              {review.helpfulCount > 0 && (
                <span>{review.helpfulCount} helpful</span>
              )}
            </button>
          </div>
          {showActions && (
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <Flag className="w-3 h-3" />
              Report
            </button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default ReviewCard;
