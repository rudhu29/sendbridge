export interface OnboardedUser {
  name: string;
  email: string;
  address: string;
  corridor: string;
  uiRating: number;
  speedRating: number;
  costRating: number;
  comment: string;
  txHash: string;
}

export interface UserFeedback {
  userAddress: string;
  ratingUi: number;
  ratingSpeed: number;
  ratingCost: number;
  comment: string;
  date: string;
}
