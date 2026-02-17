import { Injectable, ErrorHandler } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {

  handleError(error: any): void {
    console.error('Global Error Handler:', error);

    // Log error details
    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    if (error instanceof HttpErrorResponse) {
      // HTTP error
      errorInfo.message = `HTTP Error ${error.status}: ${error.message}`;
      console.error('HTTP Error Details:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        error: error.error
      });
    } else if (error instanceof Error) {
      // JavaScript error
      console.error('JavaScript Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    // In production, you would send this to a logging service
    // Example: this.loggingService.logError(errorInfo);
    
    // For development, log to console
    console.error('Error Info:', errorInfo);

    // Show user-friendly message for critical errors
    if (this.isCriticalError(error)) {
      this.showCriticalErrorMessage();
    }
  }

  private isCriticalError(error: any): boolean {
    // Define what constitutes a critical error
    if (error instanceof HttpErrorResponse) {
      return error.status >= 500;
    }
    
    // Check for specific error types that should be shown to user
    const criticalMessages = [
      'ChunkLoadError',
      'Loading chunk',
      'Network Error'
    ];
    
    return criticalMessages.some(msg => 
      error?.message?.includes(msg) || error?.name?.includes(msg)
    );
  }

  private showCriticalErrorMessage(): void {
    // You could integrate with a notification service here
    // For now, we'll use a simple alert (in production, use a proper notification system)
    
    const message = 'An unexpected error occurred. Please refresh the page and try again.';
    
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && window.confirm) {
      const shouldRefresh = window.confirm(`${message}\n\nWould you like to refresh the page now?`);
      if (shouldRefresh) {
        window.location.reload();
      }
    }
  }
}