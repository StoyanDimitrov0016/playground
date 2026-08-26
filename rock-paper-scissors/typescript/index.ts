import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import pc from "picocolors";

const CHOICES = {
  rock: "rock",
  paper: "paper",
  scissors: "scissors",
} as const;

const COMMANDS = {
  [CHOICES.rock]: CHOICES.rock,
  [CHOICES.paper]: CHOICES.paper,
  [CHOICES.scissors]: CHOICES.scissors,
  stats: "stats",
  quit: "quit",
  invalid: "invalid",
} as const;

const ROUND_RESULTS = {
  playerWon: "player_won",
  computerWon: "computer_won",
  draw: "draw",
} as const;

type Choice = (typeof CHOICES)[keyof typeof CHOICES];
type Command = (typeof COMMANDS)[keyof typeof COMMANDS];
type RoundResult = (typeof ROUND_RESULTS)[keyof typeof ROUND_RESULTS];

type SessionStatistics = {
  rounds: number;
  playerWins: number;
  computerWins: number;
  draws: number;
  startedAt: Date;
};

type Readline = ReturnType<typeof createInterface>;

const USER_PROMPT =
  "Choose: rock (r), paper (p), scissors (s), stats (st), or quit (q).";

async function main() {
  const readline = createInterface({
    input: stdin,
    output: stdout,
  });

  try {
    const stats: SessionStatistics = {
      rounds: 0,
      playerWins: 0,
      computerWins: 0,
      draws: 0,
      startedAt: new Date(),
    };

    console.log(pc.bold(pc.cyan("Rock Paper Scissors")));

    while (true) {
      const roundMessage = `${pc.bold(pc.blue(`Round ${stats.rounds + 1}`))} | ${USER_PROMPT}`;
      console.log(`\n${roundMessage}`);

      const playerCommand = await receiveUserCommand(readline);

      if (playerCommand === COMMANDS.invalid) {
        console.log(pc.red("Invalid input!"));
        continue;
      }

      if (playerCommand === COMMANDS.stats) {
        printSessionStatistics(stats);
        continue;
      }

      if (playerCommand === COMMANDS.quit) {
        printSessionStatistics(stats);
        console.log(pc.cyan("Thanks for playing!"));
        break;
      }

      const playerChoice = playerCommand;
      const computerChoice = generateComputerChoice();

      console.log(`\nYou chose: ${playerChoice}`);
      console.log(`Computer chose: ${computerChoice}`);

      const roundResult = determineRoundResult(playerChoice, computerChoice);

      updateSessionStatistics(stats, roundResult);
      printRoundResult(roundResult);
    }
  } catch (cause) {
    throw new Error("Encountered unknown error!", { cause });
  } finally {
    readline.close();
  }
}

async function receiveUserCommand(readline: Readline): Promise<Command> {
  const result = await readline.question("> ");
  const normalized = result.trim().toLowerCase();

  switch (normalized) {
    case "rock":
    case "r":
      return COMMANDS.rock;

    case "paper":
    case "p":
      return COMMANDS.paper;

    case "scissors":
    case "s":
      return COMMANDS.scissors;

    case "stats":
    case "st":
      return COMMANDS.stats;

    case "quit":
    case "q":
      return COMMANDS.quit;

    default:
      return COMMANDS.invalid;
  }
}

function generateComputerChoice(): Choice {
  const randomNumber = Math.floor(Math.random() * 3);

  switch (randomNumber) {
    case 0:
      return CHOICES.rock;

    case 1:
      return CHOICES.paper;

    default:
      return CHOICES.scissors;
  }
}

function determineRoundResult(player: Choice, computer: Choice): RoundResult {
  if (player === computer) {
    return ROUND_RESULTS.draw;
  }

  const playerWon =
    (player === CHOICES.rock && computer === CHOICES.scissors) ||
    (player === CHOICES.paper && computer === CHOICES.rock) ||
    (player === CHOICES.scissors && computer === CHOICES.paper);

  return playerWon ? ROUND_RESULTS.playerWon : ROUND_RESULTS.computerWon;
}

function updateSessionStatistics(
  stats: SessionStatistics,
  result: RoundResult,
) {
  stats.rounds++;

  switch (result) {
    case ROUND_RESULTS.playerWon:
      stats.playerWins++;
      break;

    case ROUND_RESULTS.computerWon:
      stats.computerWins++;
      break;

    case ROUND_RESULTS.draw:
      stats.draws++;
      break;
  }
}

function printRoundResult(result: RoundResult) {
  switch (result) {
    case ROUND_RESULTS.playerWon:
      console.log(`Result: ${pc.bold(pc.green("You win!"))}`);
      break;

    case ROUND_RESULTS.computerWon:
      console.log(`Result: ${pc.bold(pc.red("Computer wins!"))}`);
      break;

    case ROUND_RESULTS.draw:
      console.log(`Result: ${pc.bold(pc.yellow("Draw!"))}`);
      break;
  }
}

function printSessionStatistics(stats: SessionStatistics) {
  const elapsedMilliseconds = Date.now() - stats.startedAt.getTime();
  const elapsedSeconds = elapsedMilliseconds / 1000;

  console.log(`\n${pc.bold(pc.cyan("--- Session Statistics ---"))}`);
  console.log(`Rounds:        ${stats.rounds}`);
  console.log(`Player wins:   ${pc.green(stats.playerWins.toString())}`);
  console.log(`Computer wins: ${pc.red(stats.computerWins.toString())}`);
  console.log(`Draws:         ${pc.yellow(stats.draws.toString())}`);
  console.log(`Game time:     ${elapsedSeconds.toFixed(1)}s`);
  console.log(pc.cyan("--------------------------"));
}

main();
