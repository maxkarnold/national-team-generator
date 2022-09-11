export function checkStars(starterRating: number, squadRating: number) {
  document.documentElement.style.setProperty(
    '--starter-rating',
    `${starterRating}%`
  );
  document.documentElement.style.setProperty(
    '--squad-rating',
    `${squadRating}%`
  );
}
