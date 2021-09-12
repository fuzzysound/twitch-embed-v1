import {
  PLAYER_STATE,
  NAMESPACE,
  UPDATE,
  COMMAND,
  PLAYBACK,
} from "../constants";

class InternalPlayer {
  constructor() {
    this._embedWindow = null;
    this._playerState = PLAYER_STATE;
    window.addEventListener("message", this._handleResponses.bind(this));
  }

  _setWindowRef(element) {
    this._embedWindow = element;
  }

  _sendCommand(eventName, params) {
    if (this._embedWindow) {
      const message = {
        eventName: eventName,
        params: params,
        namespace: NAMESPACE,
      };
      this._embedWindow.postMessage(message, "*");
    } else {
      console.warn(
        "Cannot send player commands before the video player is initialized.          Please wait for the VIDEO_READY event before using the player API."
      );
    }
  }

  _handleResponses(event) {
    if (this._embedWindow) {
      const eventData = event.data;
      if (
        event.source === this._embedWindow &&
        eventData.namespace === NAMESPACE &&
        eventData.eventName === UPDATE.UpdateState
      ) {
        this._playerState = Object.assign(
          {},
          this._playerState,
          eventData.params
        );
      }
    }
  }

  disableCaptions() {
    this._sendCommand(COMMAND.DisableCaptions, null);
  }

  enableCaptions() {
    this._sendCommand(COMMAND.EnableCaptions, null);
  }

  pause() {
    this._sendCommand(COMMAND.Pause, null);
  }

  play() {
    this._sendCommand(COMMAND.Play, null);
  }

  seek(timestamp) {
    this._sendCommand(COMMAND.Seek, timestamp);
  }

  setChannel(channel) {
    this._sendCommand(COMMAND.SetChannel, channel);
  }

  setChannelId(channelId) {
    this._sendCommand(COMMAND.SetChannelID, channelId);
  }

  setCollection(collectionId, videoId) {
    this._sendCommand(COMMAND.SetCollection, [collectionId, videoId]);
  }

  setQuality(quality) {
    this._sendCommand(COMMAND.SetQuality, quality);
  }

  setVideo(videoId) {
    this._sendCommand(COMMAND.SetVideo, videoId);
  }

  setMuted(muted) {
    const flag = "boolean" == typeof muted ? muted : false;
    this._sendCommand(COMMAND.SetMuted, flag);
  }

  setVolume(volumeLevel) {
    this._sendCommand(COMMAND.SetVolume, volumeLevel);
  }

  getMuted() {
    return this._playerState.muted;
  }

  getVolume() {
    return this._playerState.volume;
  }

  getChannel() {
    return this._playerState.channelName;
  }

  getChannelId() {
    return this._playerState.channelID;
  }

  getCollection() {
    return this._playerState.collectionID;
  }

  getCurrentTime() {
    return this._playerState.currentTime;
  }

  getDuration() {
    return this._playerState.duration;
  }

  getEnded() {
    return this._playerState.ended;
  }

  getPlaybackStats() {
    return this._playerState.stats.videoStats;
  }

  getQualities() {
    return this._playerState.qualitiesAvailable;
  }

  getQuality() {
    return this._playerState.quality;
  }

  getVideo() {
    return this._playerState.videoID;
  }

  isPaused() {
    return this._playerState.playback === PLAYBACK.IDLE;
  }

  getPlayerState() {
    return this._playerState;
  }
}

export { InternalPlayer };
