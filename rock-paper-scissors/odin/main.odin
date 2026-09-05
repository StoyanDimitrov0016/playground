package main

import "core:fmt"
import "core:math/rand"
import "core:os"
import "core:time"

Session_Statistics :: struct {
	rounds:        int,
	player_wins:   int,
	computer_wins: int,
	draws:         int,
	started_at:    time.Time,
}

Input_Result :: enum {
	Invalid,
	Quit,
	Stats,
	Rock,
	Paper,
	Scissors,
}

Choice :: enum {
	Rock,
	Paper,
	Scissors,
}

Round_Result :: enum {
	Win,
	Loss,
	Draw,
}

USER_PROMPT :: "Choose: rock (r), paper (p), scissors (s), stats (st), or quit (q)."

main :: proc() {
	fmt.println("Rock Paper Scissors")

	stats := Session_Statistics{0, 0, 0, 0, time.now()}

	for {
		fmt.printf("Round %v | %v\n", stats.rounds + 1, USER_PROMPT)

		buf_read, total_read := prompt_user()
		prompt := string(buf_read[:total_read])

		result := validate_user_input(prompt)

		if result == .Invalid {
			fmt.println("Invalid input!")
			continue
		}

		if result == .Stats {
			print_session_statistics(&stats)
			continue
		}

		if result == .Quit {
			fmt.println("Thanks for playing!")
			return
		}

		player_choice: Choice

		#partial switch result {
		case .Rock:
			player_choice = .Rock
		case .Paper:
			player_choice = .Paper
		case .Scissors:
			player_choice = .Scissors
		}

		fmt.println("Your choice is:", player_choice)

		computer_choice := generate_computer_choice()

		fmt.println("Computer choice is:", computer_choice)

		round_result := determine_round(player_choice, computer_choice)

		update_session_stats(&stats, round_result)
		print_round(round_result)
	}
}

prompt_user :: proc() -> ([1024]u8, int) {
	buf_read := [1024]u8{}
	total_read, err := os.read(os.stdin, buf_read[:])

	if err != nil {
		panic("read failed")
	}

	if total_read > 0 && buf_read[total_read - 1] == '\n' {
		total_read -= 1
	}

	if total_read > 0 && buf_read[total_read - 1] == '\r' {
		total_read -= 1
	}

	return buf_read, total_read
}

validate_user_input :: proc(input: string) -> Input_Result {
	switch input {
	case "q":
		fallthrough
	case "quit":
		return .Quit
	case "r":
		fallthrough
	case "rock":
		return .Rock
	case "p":
		fallthrough
	case "paper":
		return .Paper
	case "s":
		fallthrough
	case "scissors":
		return .Scissors
	case "st":
		fallthrough
	case "stats":
		return .Stats
	}
	return .Invalid
}

print_session_statistics :: proc(stats: ^Session_Statistics) {
	elapsed := time.since(stats.started_at)
	elapsed_seconds := time.duration_seconds(elapsed)

	fmt.println("--- Session Statistics ---")
	fmt.println("Rounds:       ", stats.rounds)
	fmt.println("Player wins:  ", stats.player_wins)
	fmt.println("Computer wins:", stats.computer_wins)
	fmt.println("Draws:        ", stats.draws)
	fmt.println("Game time:    ", elapsed_seconds)
	fmt.println("--------------------------")
}

generate_computer_choice :: proc() -> Choice {
	options := [3]Choice{.Rock, .Paper, .Scissors}
	return rand.choice(options[:])
}

update_session_stats :: proc(stats: ^Session_Statistics, round: Round_Result) {
	stats.rounds += 1

	switch round {
	case .Draw:
		stats.draws += 1
	case .Win:
		stats.player_wins += 1
	case .Loss:
		stats.computer_wins += 1
	}

}

determine_round :: proc(p, c: Choice) -> Round_Result {
	if p == c {return .Draw}

	if (p == .Rock && c == .Scissors) ||
	   (p == .Paper && c == .Rock) ||
	   (p == .Scissors && c == .Paper) {
		return .Win
	}

	return .Loss
}

print_round :: proc(round: Round_Result) {
	switch round {
	case .Win:
		fmt.println("Result: You win!")
	case .Loss:
		fmt.println("Result: Computer wins!")
	case .Draw:
		fmt.println("Result: Draw!")
	}
}
