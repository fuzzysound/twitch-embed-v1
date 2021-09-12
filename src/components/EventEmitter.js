class Event {
  constructor(fn, context, once = false) {
    this.fn = fn;
    this.context = context;
    this.once = once;
  }
}

function addListener(eventEmitter, eventName, listener, altEventEmitter, once) {
  if ("function" != typeof listener)
    throw new TypeError("The listener must be a function");
  var event = new Event(listener, altEventEmitter || eventEmitter, once);
  if (eventEmitter._events[eventName]) {
    if (eventEmitter._events[eventName].fn) {
      eventEmitter._events[eventName] = [
        eventEmitter._events[eventName],
        event,
      ]; // transform to array and add event
    } else {
      eventEmitter._events[eventName].push(event);
    }
  } else {
    eventEmitter._events[eventName] = event;
    eventEmitter._eventsCount++;
    return eventEmitter;
  }
}

function removeListener(eventEmitter, eventName) {
  eventEmitter._eventsCount--;
  if (eventEmitter._eventsCount == 0) {
    eventEmitter._events = {};
  } else {
    delete eventEmitter._events[eventName];
  }
}

class EventEmitter {
  constructor() {
    this._events = {};
    this._eventsCount = 0;
  }

  eventNames() {
    const events = [];
    if (this._eventsCount === 0) return events;
    for (const event in this._events) {
      if (Object.prototype.hasOwnProperty.call(this._events, event)) {
        events.push(event);
      }
    }
    return events.concat(Object.getOwnPropertySymbols(this._events));
  }

  listeners(eventName) {
    const event = this._events[eventName];
    if (!event) return [];
    if (event.fn) return [event.fn];
    const listeners = new Array(event.length);
    for (let i = 0; i < event.length; i++) {
      listeners[i] = event[i].fn;
    }
    return listeners;
  }

  listenerCount(eventName) {
    const event = this._events[eventName];
    if (event) {
      if (event.fn) {
        return 1;
      } else {
        return event.length;
      }
    } else {
      return 0;
    }
  }

  emit(eventName, ...args) {
    if (!this._events[eventName]) return false;
    const event = this._events[eventName];
    if (event.fn) {
      if (event.once)
        this.removeEventListener(eventName, event.fn, undefined, true);
      event.fn.call(event.context, ...args);
    } else {
      for (let i = 0; i < event.length; i++) {
        if (event[i].once)
          this.removeListener(eventName, event[i].fn, undefined, true);
        event[i].fn.call(event[i].context, ...args);
      }
    }
    return true;
  }

  on(eventName, listener, altEventEmitter) {
    return addListener(this, eventName, listener, altEventEmitter, false);
  }

  once(eventName, listener, altEventEmitter) {
    return addListener(this, eventName, listener, altEventEmitter, true);
  }

  removeListener(eventName, listener, context, once) {
    if (!this._events[eventName]) return this;
    if (!listener) {
      removeListener(this, eventName);
      return this;
    }
    const event = this._events[eventName];
    if (event.fn)
      event.fn !== listener ||
        (once && !event.once) ||
        (context && event.context !== context) ||
        removeListener(this, eventName);
    else {
      const eventsToRemove = [];
      for (let i = 0; i < event.length; i++) {
        if (
          event[i].fn !== listener ||
          (once && !event[i].once) ||
          (context && event[i].context !== context)
        ) {
          eventsToRemove.push(event[i]);
        }
      }
      if (eventsToRemove) {
        if (eventsToRemove.length === 1) {
          this._events[eventName] = eventsToRemove[0];
        } else {
          this._events[eventName] = eventsToRemove;
        }
      } else {
        removeListener(this, eventName);
      }
    }
    return this;
  }

  removeAllListeners(eventName) {
    if (eventName) {
      if (this._events[eventName]) removeListener(this, eventName);
    } else {
      this._events = {};
      this._eventsCount = 0;
    }
    return this;
  }

  off(eventName, listener, context, once) {
    this.removeListener(eventName, listener, context, once);
  }

  addListener(eventName, listener, altEventEmitter) {
    this.on(eventName, listener, altEventEmitter);
  }
}

export { EventEmitter };
