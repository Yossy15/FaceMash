/**
 * Utility functions for safe localStorage operations
 * Handles cases where localStorage might not be available (SSR, build process)
 */

export class StorageUtil {
  
  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Safely get item from localStorage
   */
  static getItem(key: string): string | null {
    if (this.isAvailable()) {
      return localStorage.getItem(key);
    }
    return null;
  }

  /**
   * Safely set item in localStorage
   */
  static setItem(key: string, value: string): void {
    if (this.isAvailable()) {
      localStorage.setItem(key, value);
    }
  }

  /**
   * Safely remove item from localStorage
   */
  static removeItem(key: string): void {
    if (this.isAvailable()) {
      localStorage.removeItem(key);
    }
  }

  /**
   * Safely clear localStorage
   */
  static clear(): void {
    if (this.isAvailable()) {
      localStorage.clear();
    }
  }

  /**
   * Get user data safely
   */
  static getUserData() {
    return {
      aid: this.getItem('aid'),
      avatar_img: this.getItem('avatar_img') || "https://static.vecteezy.com/system/resources/previews/013/494/828/original/web-avatar-illustration-on-a-white-background-free-vector.jpg",
      name: this.getItem('name'),
      email: this.getItem('email')
    };
  }

  /**
   * Set user data safely
   */
  static setUserData(data: { aid?: string; avatar_img?: string; name?: string; email?: string }) {
    if (data.aid) this.setItem('aid', data.aid);
    if (data.avatar_img) this.setItem('avatar_img', data.avatar_img);
    if (data.name) this.setItem('name', data.name);
    if (data.email) this.setItem('email', data.email);
  }
}
