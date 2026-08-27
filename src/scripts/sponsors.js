export function initSponsorsSection() {
  const dotsElement = document.querySelector('.loading-dots');
  if (!dotsElement) return;

  const dotStages = ['.', '..', '...'];
  let currentStage = 0;

  setInterval(() => {
    currentStage = (currentStage + 1) % dotStages.length;
    dotsElement.textContent = dotStages[currentStage];
  }, 500);
}
