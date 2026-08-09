export type Listener<T> = (event: T) => void;

export class EventEmitter<Events> {
  private listeners = new Map<
    keyof Events,
    Set<Listener<Events[keyof Events]>>
  >();

  on<K extends keyof Events>(
    event: K,
    listener: Listener<Events[K]>
  ): () => void {
    const existing =
      this.listeners.get(event) ??
      new Set<Listener<Events[keyof Events]>>();

    existing.add(
      listener as Listener<Events[keyof Events]>
    );

    this.listeners.set(event, existing);

    return () => {
      existing.delete(
        listener as Listener<Events[keyof Events]>
      );

      if (existing.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  emit<K extends keyof Events>(
    event: K,
    payload: Events[K]
  ): void {
    const listeners = this.listeners.get(event);

    if (!listeners) {
      return;
    }

    listeners.forEach((listener) => {
      listener(payload);
    });
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}