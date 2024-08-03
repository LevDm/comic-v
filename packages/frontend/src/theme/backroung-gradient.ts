export const backgroundGradient = () => {
  const main = '#ce93d850';
  const ground = '#1F1D2B';
  const part = 44.5;
  const angle = 59;
  const lg1 = `linear-gradient(transparent, ${ground})`;
  const lg2 = `linear-gradient(${angle}deg, transparent, ${main} ${part}%, transparent ${part + 0.01}%)`;
  const lg3 = `linear-gradient(-${angle}deg, transparent, ${main} ${part}%, transparent ${part + 0.01}%)`;

  return `${lg1}, ${lg2}, ${lg3}`;
};
