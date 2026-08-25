import type { ClubRecord } from "../data/goalunitData";
import { formatMillions } from "../data/goalunitRepository";

type RevenueAssetsChartProps = {
  clubs: ClubRecord[];
  selectedClubName: string;
};

export function RevenueAssetsChart({
  clubs,
  selectedClubName,
}: RevenueAssetsChartProps) {
  const currentSeason = clubs.filter(
    (club) => club.seasonName === clubs[0]?.seasonName,
  );
  const maxValue = Math.max(
    ...currentSeason.map((club) =>
      Math.max(club.totalAssets, club.totalRevenues),
    ),
  );

  return (
    <div className="bar-chart">
      {currentSeason.map((club) => {
        const isSelected = club.clubName === selectedClubName;
        const revenueWidth = (club.totalRevenues / maxValue) * 100;
        const assetsWidth = (club.totalAssets / maxValue) * 100;
        return (
          <div
            key={club.clubName}
            className={`bar-row ${isSelected ? "bar-row--selected" : ""}`}
          >
            <span className="bar-label">{club.clubName}</span>
            <div className="bar-stack">
              <div
                className="bar bar--assets"
                style={{ width: `${assetsWidth}%` }}
                title={`Assets: ${formatMillions(club.totalAssets)}`}
              ></div>
              <div
                className="bar bar--revenue"
                style={{ width: `${revenueWidth}%` }}
                title={`Revenue: ${formatMillions(club.totalRevenues)}`}
              ></div>
            </div>
            <span className="bar-value">
              {formatMillions(club.totalRevenues)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
