import { InternalPlayer } from "./InternalPlayer";
import { EventEmitter } from "./EventEmitter";
import { MissingElementError, MissingParameterError } from "../errors";
import { createIframe } from "../utils";
import { STATUS, ERROR_CODE } from "../constants";

class Embed {
  constructor(target, options) {
    this._player = new InternalPlayer();
    this._iframe = null;
    this._forwardEmbedEvents = function (event) {
      if (this._iframe) {
        var eventData = event.data;
        if (
          event.source === this._iframe.contentWindow &&
          eventData.namespace === "twitch-embed"
        ) {
          this._eventEmitter.emit(eventData.eventName, eventData.params);
        }
      }
    };
    this.disableCaptions = () => this.getPlayer().disableCaptions();
    this.enableCaptions = () => this.getPlayer().enableCaptions();
    this.pause = () => this.getPlayer().pause();
    this.play = () => this.getPlayer().play();
    this.seek = (timestamp) => this.getPlayer().seek(timestamp);
    this.setChannel = (channel) => this.getPlayer().setChannel(channel);
    this.setChannelId = (channelId) => this.getPlayer().setChannelId(channelId);
    this.setCollection = (collectionId, videoId) =>
      this.getPlayer().setCollection(collectionId, videoId);
    this.setQuality = (quality) => this.getPlayer().setQuality(quality);
    this.setVideo = (videoId) => this.getPlayer().setVideo(videoId);
    this.setMuted = (muted) => this.getPlayer().setMuted(muted);
    this.setVolume = (volumeLevel) => this.getPlayer().setVolume(volumeLevel);
    this.getMuted = () => this.getPlayer().getMuted();
    this.getVolume = () => this.getPlayer().getVolume();
    this.getChannel = () => this.getPlayer().getChannel();
    this.getChannelId = () => this.getPlayer().getChannelId();
    this.getCollection = () => this.getPlayer().getCollection();
    this.getCurrentTime = () => this.getPlayer().getCurrentTime();
    this.getDuration = () => this.getPlayer().getDuration();
    this.getEnded = () => this.getPlayer().getEnded();
    this.getPlaybackStats = () => this.getPlayer().getPlaybackStats();
    this.getPlayerState = () => this.getPlayer().getPlayerState();
    this.getQualities = () => this.getPlayer().getQualities();
    this.getQuality = () => this.getPlayer().getQuality();
    this.getVideo = () => this.getPlayer().getVideo();
    this.isPaused = () => this.getPlayer().isPaused();

    if (
      !options ||
      (!options.channel &&
        !options.video &&
        !options.collection &&
        !options.channelId &&
        !options.stream)
    ) {
      throw new MissingParameterError(
        "A channel, video, or collection id must be provided in options"
      );
    }
    this._options = options;

    if (!target)
      throw new MissingParameterError(
        "An element of type String or Element is required"
      );
    const element =
      "string" == typeof target ? document.getElementById(target) : target;
    if (!element) throw new MissingElementError(target);
    if (1 !== element.nodeType)
      throw new MissingParameterError(
        "An element of type String or Element is required"
      );
    this._target = element;

    this._eventEmitter = new EventEmitter();
    this.render();
  }

  addEventListener(eventName, listener) {
    if (this._eventEmitter) this._eventEmitter.on(eventName, listener);
  }

  removeEventListener(eventName, listener) {
    if (this._eventEmitter)
      this._eventEmitter.removeListener(eventName, listener);
  }

  getPlayer() {
    return this._player;
  }

  destroy() {
    if (this._eventEmitter) this._eventEmitter.removeAllListeners();
    window.removeEventListener("message", this._forwardEmbedEvents);
    if (
      this._iframe !== null &&
      this._iframe !== undefined &&
      this._iframe.parentNode !== null &&
      this._iframe.parentNode !== undefined
    ) {
      this._iframe.parentNode.removeChild(this._iframe);
    }
    this._eventEmitter = null;
    this._player._setWindowRef(null);
    this._target = null;
    this._iframe = null;
  }

  buildIframe() {
    return createIframe(this._options, "embed");
  }

  render() {
    if (this._target) {
      const iframe = this.buildIframe();
      this._target.appendChild(iframe);
      this._iframe = iframe;
      window.addEventListener("message", this._forwardEmbedEvents);
      this._player._setWindowRef(this._iframe.contentWindow);
    }
  }
}

Embed.AUTHENTICATE = STATUS.AUTHENTICATE;
Embed.CAPTIONS = STATUS.CAPTIONS;
Embed.ENDED = STATUS.ENDED;
Embed.ERROR = STATUS.ERROR;
Embed.OFFLINE = STATUS.OFFLINE;
Embed.ONLINE = STATUS.ONLINE;
Embed.PAUSE = STATUS.PAUSE;
Embed.PLAY = STATUS.PLAY;
Embed.PLAYBACK_BLOCKED = STATUS.PLAYBACK_BLOCKED;
Embed.PLAYING = STATUS.PLAYING;
Embed.VIDEO_PAUSE = STATUS.VIDEO_PAUSE;
Embed.VIDEO_PLAY = STATUS.VIDEO_PLAY;
Embed.VIDEO_READY = STATUS.VIDEO_READY;
Embed.READY = STATUS.READY;
Embed.Errors = Object.assign(
  {
    ABORTED: ERROR_CODE.Aborted,
    NETWORK: ERROR_CODE.Network,
    DECODE: ERROR_CODE.Decode,
    FORMAT_NOT_SUPPORTED: ERROR_CODE.FormatNotSupported,
    CONTENT_NOT_AVAILABLE: ERROR_CODE.ContentNotAvailable,
    RENDERER_NOT_AVAILABLE: ERROR_CODE.RendererNotAvailable,
  },
  ERROR_CODE
);

export { Embed };
