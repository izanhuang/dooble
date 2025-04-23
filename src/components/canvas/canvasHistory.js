// Store canvas states for undo/redo
export class CanvasHistory {
  constructor() {
    this.states = [];
    this.currentIndex = -1;
    this.maxStates = 50; // Limit history to prevent memory issues
    this.initialState = null; // Store the initial empty canvas state
  }

  // Initialize with empty canvas state
  initialize(canvas) {
    if (!this.initialState) {
      this.initialState = canvas.toDataURL();
      this.states.push(this.initialState);
      this.currentIndex = 0;
    }
  }

  // Save current canvas state
  saveState(canvas) {
    // Remove any states after current index (if we're in the middle of history)
    this.states = this.states.slice(0, this.currentIndex + 1);

    // Add new state
    const imageData = canvas.toDataURL();
    this.states.push(imageData);
    this.currentIndex++;

    // Trim history if it exceeds max states
    if (this.states.length > this.maxStates) {
      this.states.shift();
      this.currentIndex--;
    }
  }

  // Undo last action
  undo(canvas) {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.restoreState(canvas);
      return true;
    } else if (this.currentIndex === 0) {
      // If we're at the first state, restore to initial empty state
      this.currentIndex = -1;
      this.restoreInitialState(canvas);
      return true;
    }
    return false;
  }

  // Redo last undone action
  redo(canvas) {
    if (this.currentIndex < this.states.length - 1) {
      this.currentIndex++;
      this.restoreState(canvas);
      return true;
    }
    return false;
  }

  // Restore canvas to a specific state
  restoreState(canvas) {
    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.src = this.states[this.currentIndex];
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
    };
  }

  // Restore to initial empty state
  restoreInitialState(canvas) {
    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.src = this.initialState;
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
    };
  }

  // Check if undo is possible
  canUndo() {
    // Only allow undo if we have more than just the initial empty state
    return this.states.length > 1 && this.currentIndex > 0;
  }

  // Check if redo is possible
  canRedo() {
    return this.currentIndex < this.states.length - 1;
  }

  // Clear history
  clear() {
    this.states = [];
    this.currentIndex = -1;
    if (this.initialState) {
      this.states.push(this.initialState);
      this.currentIndex = 0;
    }
  }
}
