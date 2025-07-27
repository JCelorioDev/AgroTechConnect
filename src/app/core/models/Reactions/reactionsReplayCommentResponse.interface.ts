export interface ReactionsReplayCommentResponse {
  message:    string;
  statusCode: number;
  error:      boolean;
  data:       Data;
}

export interface Data {
  all_reactions:      any[];
  positive_reactions: any[];
  negative_reactions: any[];
  counts:             Counts;
}

export interface Counts {
  total:    number;
  positive: number;
  negative: number;
}
