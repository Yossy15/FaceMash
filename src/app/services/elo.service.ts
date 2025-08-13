import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EloService {
  private readonly K_FACTOR = 32;

  constructor() { }

  /**
   * คำนวณความน่าจะเป็นที่ผู้เล่นจะชนะ
   */
  calculateProbability(playerRating: number, opponentRating: number): number {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  }

  /**
   * คำนวณคะแนนใหม่ของผู้เล่น
   */
  calculateNewRating(
    playerRating: number,
    opponentRating: number,
    playerWin: boolean
  ): number {
    const playerScore = playerWin ? 1 : 0;
    const expectedScore = this.calculateProbability(playerRating, opponentRating);

    const newRating = playerRating + this.K_FACTOR * (playerScore - expectedScore);

    // ปัดเป็นจำนวนเต็ม และป้องกันติดลบ
    return Math.max(Math.round(newRating), 0);
  }

  /**
   * คำนวณคะแนนใหม่ของผู้เล่นทั้งสองคนในแมตช์เดียว
   */
  calculateMatchResult(
    player1Rating: number,
    player2Rating: number,
    player1Win: boolean
  ): { player1New: number; player2New: number } {
    const player1New = this.calculateNewRating(player1Rating, player2Rating, player1Win);
    const player2New = this.calculateNewRating(player2Rating, player1Rating, !player1Win);

    return { player1New, player2New };
  }
}
