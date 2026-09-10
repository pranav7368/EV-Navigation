import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  rankCandidates,
  type Preference,
  type RecommendationWeightConfig,
  type StationCandidate,
} from "@smartev/shared";

@Injectable()
export class RecommendationsService {
  constructor(private readonly config: ConfigService) {}
  rank(candidates: StationCandidate[], preference: Preference) {
    return rankCandidates(
      candidates,
      preference,
      this.config.getOrThrow<RecommendationWeightConfig>("planning.weights"),
    );
  }
}
