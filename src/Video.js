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

class Video extends React.Component<Props> {
  state = {}
  _videoRef: Video

  setNativeProps(props: Object) {
    if (this._videoRef) {
      this._videoRef.setNativeProps(props)
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

  _onProgress = event => {
    if (this.props.onProgress) {
      this.props.onProgress(event.nativeEvent)
    }
  }

  _onSeek = event => {
    if (this.state.showPoster) {
      this.setState({ showPoster: false })
    }

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
    if (this.state.showPoster && event.nativeEvent.playbackRate !== 0) {
      this.setState({ showPoster: false })
    }

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

  componentDidMount() {
    const video = this._videoRef
    const source = this.props.source.uri || this.props.source
    if (!window.Hls || source.indexOf('.m3u8') === -1) return

    if (Hls.isSupported()) {
      var hls = new Hls()
      hls.loadSource(source)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play())
    }
    // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
    // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
    // This is using the built-in support of the plain video element, without using hls.js.
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source
      video.addEventListener('canplay', () => video.play())
    }
  }

  seek(time: number) {
    this._videoRef.currentTime = time
  }

  render() {
    const { controls, paused, source, style, volume } = this.props

    return createElement('video', {
      autoPlay: !paused,
      ref: ref => (this._videoRef = ref),
      src: source.uri || source,
      onLoadStart: this._onLoadStart.bind(this),
      onLoadedData: this._onLoad.bind(this),
      onError: this._onError.bind(this),
      onProgress: this._onProgress.bind(this),
      onSeeking: this._onSeek.bind(this),
      onEnded: this._onEnd.bind(this),
      onLoadedMetadata: this._onTimedMetadata.bind(this),
      onCanPlay: this._onReadyForDisplay.bind(this),
      onStalled: this._onPlaybackStalled.bind(this),
      volume,
      controls,
      style,
    })
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

export default Video
