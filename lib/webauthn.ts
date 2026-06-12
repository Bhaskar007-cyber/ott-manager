export let currentChallenge = "";

export function setChallenge(
  challenge: string
) {
  currentChallenge = challenge;
}

export function getChallenge() {
  return currentChallenge;
}