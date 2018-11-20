// @flow

import React from 'react'
import { createElement, StyleSheet, ViewPropTypes } from 'react-native'

import { PropTypes } from 'prop-types'

type NormalProps = {
  /* Native only */
  source: Object,
  seek?: ?number,
  fullscreen?: ?boolean,
  controls?: ?boolean,
  onVideoLoadStart?: ?Function,
  onVideoLoad?: ?Function,
  onVideoBuffer?: ?Function,
  onVideoError?: ?Function,
  onVideoProgress?: ?Function,
  onVideoSeek?: ?Function,
  onVideoEnd?: ?Function,
  onTimedMetadata?: ?Function,
  onVideoFullscreenPlayerWillPresent?: ?Function,
  onVideoFullscreenPlayerDidPresent?: ?Function,
  onVideoFullscreenPlayerWillDismiss?: ?Function,
  onVideoFullscreenPlayerDidDismiss?: ?Function,
  onLoadStart?: ?Function,
  onLoad?: ?Function,
  onBuffer: ?Function,
  onError: ?Function,
  onProgress: ?Function,
  onSeek: ?Function,
  onEnd: ?Function,
  width?: ?number,
  heigth?: ?number,
  style: ?PropTypes.StyleSheet,

  // resizeMode: PropTypes.string,
  // poster: PropTypes.string,
  // repeat: PropTypes.bool,
  // paused: PropTypes.bool,
  // muted: PropTypes.bool,
  // volume: PropTypes.number,
  // rate: PropTypes.number,
  // playInBackground: PropTypes.bool,
  // playWhenInactive: PropTypes.bool,
  // ignoreSilentSwitch: PropTypes.oneOf(['ignore', 'obey']),
  // disableFocus: PropTypes.bool,
  // controls: PropTypes.bool,
  // currentTime: PropTypes.number,
  // progressUpdateInterval: PropTypes.number,
  // onFullscreenPlayerWillPresent: PropTypes.func,
  // onFullscreenPlayerDidPresent: PropTypes.func,
  // onFullscreenPlayerWillDismiss: PropTypes.func,
  // onFullscreenPlayerDidDismiss: PropTypes.func,
  // onReadyForDisplay: PropTypes.func,
  // onPlaybackStalled: PropTypes.func,
  // onPlaybackResume: PropTypes.func,
  // onPlaybackRateChange: PropTypes.func,
  // onAudioFocusChanged: PropTypes.func,
  // onAudioBecomingNoisy: PropTypes.func,
}

/* $FlowFixMe - the renderItem passed in from SectionList is optional there but
 * required here */
type Props = NormalProps

export default class Video extends React.Component<Props> {
  hlsFragment: { programDateTime: ?number, start: number }
  hlsFragmentUpdatedAt: Date
  progressTimer: ?IntervalID
  videoElement: HTMLVideoElement

  constructor(props: Props) {
    super(props)

    this._onLoadStart = this._onLoadStart.bind(this)
    this._onLoad = this._onLoad.bind(this)
    this._onError = this._onError.bind(this)
    this._onProgress = this._onProgress.bind(this)
    this._onSeek = this._onSeek.bind(this)
    this._onEnd = this._onEnd.bind(this)
    this._onTimedMetadata = this._onTimedMetadata.bind(this)
    this._onReadyForDisplay = this._onReadyForDisplay.bind(this)
    this._onPlaybackStalled = this._onPlaybackStalled.bind(this)

    this.onPlay = this.onPlay.bind(this)
    this.onPause = this.onPause.bind(this)
  }

  setNativeProps(props: Object) {
    if (this.videoElement) {
      this.videoElement.setNativeProps(props)
    }
  }

  componentDidMount() {
    this.setUpHls()
    this.startProgressTimer()
  }

  componentDidUpdate() {
    this.startProgressTimer()
  }

  render() {
    const { controls, paused, source, style, volume } = this.props

    return createElement('video', {
      autoPlay: !paused,
      ref: ref => (this.videoElement = ref),
      src: source.uri || source,
      onLoadStart: this._onLoadStart,
      onLoadedData: this._onLoad,
      onError: this._onError,
      onPlay: this.onPlay,
      onPause: this.onPlay,
      onProgress: this._onProgress,
      onSeeking: this._onSeek,
      onEnded: this._onEnd,
      onLoadedMetadata: this._onTimedMetadata,
      onCanPlay: this._onReadyForDisplay,
      onStalled: this._onPlaybackStalled,
      volume,
      controls,
      style,
    })
  }

  seek(time: number) {
    this.videoElement.currentTime = time
  }

  setUpHls() {
    const video = this.videoElement
    const source = this.props.source.uri || this.props.source
    if (!window.Hls || source.indexOf('.m3u8') === -1) return

    if (Hls.isSupported()) {
      var hls = new Hls({
        liveSyncDurationCount: 10,
        liveMaxLatencyDurationCount: 15,
      })
      hls.loadSource(source)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play())
      hls.on(Hls.Events.FRAG_CHANGED, (event, data) => {
        this.hlsFragment = data.frag
        this.hlsFragmentUpdatedAt = new Date()
        console.log('FRAG_CHANGED', data.frag)
      })
    }
    // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
    // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
    // This is using the built-in support of the plain video element, without using hls.js.
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source
      video.addEventListener('canplay', () => video.play())
    }
  }

  _onLoadStart = event => {
    if (this.props.onLoadStart) {
      this.props.onLoadStart(event.nativeEvent)
    }
  }

  _onLoad = event => {
    if (this.props.onLoad) {
      this.props.onLoad(event.nativeEvent)
    }
  }

  _onError = event => {
    if (this.props.onError) {
      this.props.onError(event.nativeEvent)
    }
  }

  onPlay = event => {
    this.startProgressTimer()
  }

  onPause = event => {
    this.stopProgressTimer()
  }

  _onProgress = event => {
    // if (this.props.onProgress) {
    //   this.props.onProgress(event.nativeEvent)
    // }
  }

  _onSeek = event => {
    if (this.props.onSeek) {
      this.props.onSeek(event.nativeEvent)
    }
  }

  _onEnd = event => {
    if (this.props.onEnd) {
      this.props.onEnd(event.nativeEvent)
    }
  }

  _onTimedMetadata = event => {
    if (this.props.onTimedMetadata) {
      this.props.onTimedMetadata(event.nativeEvent)
    }
  }

  _onFullscreenPlayerWillPresent = event => {
    if (this.props.onFullscreenPlayerWillPresent) {
      this.props.onFullscreenPlayerWillPresent(event.nativeEvent)
    }
  }

  _onFullscreenPlayerDidPresent = event => {
    if (this.props.onFullscreenPlayerDidPresent) {
      this.props.onFullscreenPlayerDidPresent(event.nativeEvent)
    }
  }

  _onFullscreenPlayerWillDismiss = event => {
    if (this.props.onFullscreenPlayerWillDismiss) {
      this.props.onFullscreenPlayerWillDismiss(event.nativeEvent)
    }
  }

  _onFullscreenPlayerDidDismiss = event => {
    if (this.props.onFullscreenPlayerDidDismiss) {
      this.props.onFullscreenPlayerDidDismiss(event.nativeEvent)
    }
  }

  _onReadyForDisplay = event => {
    if (this.props.onReadyForDisplay) {
      this.props.onReadyForDisplay(event.nativeEvent)
    }
  }

  _onPlaybackStalled = event => {
    if (this.props.onPlaybackStalled) {
      this.props.onPlaybackStalled(event.nativeEvent)
    }
  }

  _onPlaybackResume = event => {
    if (this.props.onPlaybackResume) {
      this.props.onPlaybackResume(event.nativeEvent)
    }
  }

  _onPlaybackRateChange = event => {
    if (this.props.onPlaybackRateChange) {
      this.props.onPlaybackRateChange(event.nativeEvent)
    }
  }

  _onAudioBecomingNoisy = () => {
    if (this.props.onAudioBecomingNoisy) {
      this.props.onAudioBecomingNoisy()
    }
  }

  _onAudioFocusChanged = event => {
    if (this.props.onAudioFocusChanged) {
      this.props.onAudioFocusChanged(event.nativeEvent)
    }
  }

  _onBuffer = event => {
    if (this.props.onBuffer) {
      this.props.onBuffer(event.nativeEvent)
    }
  }

  onProgress = () => {
    if (!this.props.onProgress) return
    let currentDate
    if (this.hlsFragment && this.hlsFragment.programDateTime) {
      currentDate = new Date(
        this.hlsFragment.programDateTime -
          this.hlsFragment.start +
          this.videoElement.currentTime
      ).toISOString()
    }

    const payload = {
      currentDate,
      currentTime: this.videoElement.currentTime,
      seekableDuration: this.videoElement.duration,
    }
    this.props.onProgress(payload)
  }

  startProgressTimer() {
    if (!this.progressTimer && this.props.progressUpdateInterval) {
      this.onProgress()
      this.progressTimer = setInterval(
        this.onProgress,
        this.props.progressUpdateInterval
      )
    }
  }

  stopProgressTimer() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer)
      this.progressTimer = null
    }
  }
}

Video.propTypes = {
  /* Native only */
  seek: PropTypes.number,
  fullscreen: PropTypes.bool,
  onVideoLoadStart: PropTypes.func,
  onVideoLoad: PropTypes.func,
  onVideoBuffer: PropTypes.func,
  onVideoError: PropTypes.func,
  onVideoProgress: PropTypes.func,
  onVideoSeek: PropTypes.func,
  onVideoEnd: PropTypes.func,
  onTimedMetadata: PropTypes.func,
  onVideoFullscreenPlayerWillPresent: PropTypes.func,
  onVideoFullscreenPlayerDidPresent: PropTypes.func,
  onVideoFullscreenPlayerWillDismiss: PropTypes.func,
  onVideoFullscreenPlayerDidDismiss: PropTypes.func,
  style: PropTypes.StyleSheet,

  /* Wrapper component */
  source: PropTypes.oneOfType([
    PropTypes.shape({
      uri: PropTypes.string,
    }),
    // Opaque type returned by require('./video.mp4')
    PropTypes.number,
  ]),
  resizeMode: PropTypes.string,
  poster: PropTypes.string,
  repeat: PropTypes.bool,
  paused: PropTypes.bool,
  muted: PropTypes.bool,
  volume: PropTypes.number,
  rate: PropTypes.number,
  playInBackground: PropTypes.bool,
  playWhenInactive: PropTypes.bool,
  ignoreSilentSwitch: PropTypes.oneOf(['ignore', 'obey']),
  disableFocus: PropTypes.bool,
  controls: PropTypes.bool,
  currentTime: PropTypes.number,
  progressUpdateInterval: PropTypes.number,
  onLoadStart: PropTypes.func,
  onLoad: PropTypes.func,
  onBuffer: PropTypes.func,
  onError: PropTypes.func,
  onProgress: PropTypes.func,
  onSeek: PropTypes.func,
  onEnd: PropTypes.func,
  onFullscreenPlayerWillPresent: PropTypes.func,
  onFullscreenPlayerDidPresent: PropTypes.func,
  onFullscreenPlayerWillDismiss: PropTypes.func,
  onFullscreenPlayerDidDismiss: PropTypes.func,
  onReadyForDisplay: PropTypes.func,
  onPlaybackStalled: PropTypes.func,
  onPlaybackResume: PropTypes.func,
  onPlaybackRateChange: PropTypes.func,
  onAudioFocusChanged: PropTypes.func,
  onAudioBecomingNoisy: PropTypes.func,

  /* Required by react-native */
  scaleX: PropTypes.number,
  scaleY: PropTypes.number,
  translateX: PropTypes.number,
  translateY: PropTypes.number,
  rotation: PropTypes.number,
  ...ViewPropTypes,
}
