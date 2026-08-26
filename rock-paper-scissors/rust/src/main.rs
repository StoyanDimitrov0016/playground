use colored::Colorize;
use rand::RngExt;
use std::io;
use std::time::Instant;

#[derive(Debug, Copy, Clone)]
enum Choice {
    Rock,
    Paper,
    Scissors,
}

#[derive(Debug)]
enum PlayerCommand {
    Play(Choice),
    Stats,
    Quit,
}

#[derive(Debug, Copy, Clone, PartialEq)]
enum GameRoundResult {
    PlayerWon,
    ComputerWon,
    Draw,
}

#[derive(Debug)]
struct SessionStatistics {
    rounds: u32,
    player_wins: u32,
    computer_wins: u32,
    draws: u32,
    started_at: Instant,
}

impl SessionStatistics {
    fn new() -> Self {
        Self {
            rounds: 0,
            player_wins: 0,
            computer_wins: 0,
            draws: 0,
            started_at: Instant::now(),
        }
    }
}

const USER_PROMPT: &str = "Choose: rock (r), paper (p), scissors (s), stats (st), or quit (q).";

fn main() {
    println!("{}", "Rock Paper Scissors".bold().cyan());

    let mut stats = SessionStatistics::new();

    loop {
        let round_message = format!(
            "{} | {}",
            format!("Round {}", stats.rounds + 1).bold().blue(),
            USER_PROMPT
        );
        println!("\n{round_message}");

        let player_command = receive_player_command();

        let player_choice = match player_command {
            Some(PlayerCommand::Play(choice)) => choice,
            Some(PlayerCommand::Stats) => {
                print_session_stats(&stats);
                continue;
            }
            Some(PlayerCommand::Quit) => {
                print_session_stats(&stats);
                println!("{}", "Thanks for playing!".cyan());
                break;
            }
            None => {
                println!("{}", "Invalid choice!".red());
                continue;
            }
        };

        let computer_choice = generate_computer_choice();

        println!("\nYou chose: {:?}", player_choice);
        println!("Computer chose: {:?}", computer_choice);

        let round_result = determine_round_result(player_choice, computer_choice);

        update_session_stats(&mut stats, round_result);

        match round_result {
            GameRoundResult::PlayerWon => println!("Result: {}", "You win!".bold().green()),
            GameRoundResult::ComputerWon => println!("Result: {}", "Computer wins!".bold().red()),
            GameRoundResult::Draw => println!("Result: {}", "Draw!".bold().yellow()),
        }
    }
}

fn generate_computer_choice() -> Choice {
    let mut rng = rand::rng();
    let random_number = rng.random_range(0..3);

    match random_number {
        0 => Choice::Rock,
        1 => Choice::Paper,
        2 => Choice::Scissors,
        _ => unreachable!(),
    }
}

fn receive_player_command() -> Option<PlayerCommand> {
    let mut input = String::new();

    io::stdin()
        .read_line(&mut input)
        .expect("Error reading player input!");

    let input = input.trim().to_lowercase();

    match input.as_str() {
        "rock" | "r" => Some(PlayerCommand::Play(Choice::Rock)),
        "paper" | "p" => Some(PlayerCommand::Play(Choice::Paper)),
        "scissors" | "s" => Some(PlayerCommand::Play(Choice::Scissors)),
        "stats" | "st" => Some(PlayerCommand::Stats),
        "quit" | "q" => Some(PlayerCommand::Quit),
        _ => None,
    }
}

fn determine_round_result(player: Choice, computer: Choice) -> GameRoundResult {
    match (player, computer) {
        (Choice::Rock, Choice::Rock)
        | (Choice::Paper, Choice::Paper)
        | (Choice::Scissors, Choice::Scissors) => GameRoundResult::Draw,

        (Choice::Rock, Choice::Scissors)
        | (Choice::Paper, Choice::Rock)
        | (Choice::Scissors, Choice::Paper) => GameRoundResult::PlayerWon,

        _ => GameRoundResult::ComputerWon,
    }
}

fn update_session_stats(stats: &mut SessionStatistics, result: GameRoundResult) {
    stats.rounds += 1;

    match result {
        GameRoundResult::PlayerWon => stats.player_wins += 1,
        GameRoundResult::ComputerWon => stats.computer_wins += 1,
        GameRoundResult::Draw => stats.draws += 1,
    }
}

fn print_session_stats(stats: &SessionStatistics) {
    let elapsed = stats.started_at.elapsed();

    println!("\n{}", "--- Session Statistics ---".bold().cyan());
    println!("Rounds:        {}", stats.rounds);
    println!("Player wins:   {}", stats.player_wins.to_string().green());
    println!("Computer wins: {}", stats.computer_wins.to_string().red());
    println!("Draws:         {}", stats.draws.to_string().yellow());
    println!("Game time:     {:.1}s", elapsed.as_secs_f64());
    println!("{}", "--------------------------".cyan());
}
