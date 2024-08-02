import { ChangeDetectionStrategy, Component, ComponentRef, ElementRef, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
// import HLS from 'hls.js';
import { VideoService } from '../services/video.service';
import { VolumeService } from '../services/volume.service';
import { VideoTimeService } from '../services/video-time.service';
import { VideoPlaybackService } from '../services/video-playback.service';
import { VideoPlaylistService } from '../services/video-playlist.service';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
declare var Hls: any;
// declare var $: any;

@Component({
  selector: 'app-video-wrapper',
  templateUrl: './video-wrapper.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class VideoWrapperComponent implements OnInit, OnDestroy {
  public loading!: boolean;
  public ignore!: boolean;
  public playback!: number;
  public playing = false;
  // @Input() public playlistItem!:any;
  // @Input() public destroyVideoPlayer!:boolean;
  public vid_player = document.querySelector('.video-container');
  videoUrl: string = 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8';
  // private videoListeners: Record<string, any>;

  subscriptionList: Subscription[] = [];
  // subscription: any;
  @Output() onGetBitrates: EventEmitter<any[]> = new EventEmitter();
  @Output() onGetAudioTracks: EventEmitter<any[]> = new EventEmitter();
  @Output() onGetSubtitleTracks: EventEmitter<any[]> = new EventEmitter();
  @Input() songPlayer!: boolean;

  audioTracks: any;
  trackIndicesToCombine: any[] = [];
  gainNodes: any[] = [];

  selectedAudioTracks: any[] = [];
  audioElements: HTMLAudioElement[] = [];

  // private hls: any;
  private hls: any;
  private audioHls: any;
  public config: any = {
    autoStartLoad: true,
    startPosition: -1,
    startLevel: -1,
    maxMaxBufferLength: 999999999,
    maxBufferLength: 999999999,
    backBufferLength: 999999999,
    // debug: true,
    xhrSetup: function (xhr, url) {
      xhr.withCredentials = true; // do send cookies

      // xhr.setRequestHeader("Access-Control-Allow-Headers", "Content-Type, Accept, X-Requested-With");
      // xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
      // xhr.setRequestHeader("Access-Control-Allow-Credentials", "true");
    }
  }

  timeoutID: any;
  videoData: any;
  private videoListeners: Record<string, any> = {
    loadedmetadata: () => this.videoTimeService.setVideoDuration(this.video.nativeElement.duration),
    canplay: () => this.videoService.setLoading(false),
    seeking: () => this.videoService.setLoading(false),
    waiting: () => {
      this.videoService.setLoading(true);
      this.syncAudioWithVideo();
    },
    playing: () => this.videoService.play(),
    loop: () => this.videoService.setVideoLoop(false),
    play: () => this.syncAudioWithVideo(),
    pause: () => this.pauseAudio(),
    // Buffer: () => this.videoService.setLoading(true),
    progress: () => {
      this.videoTimeService.setVideoBufferProgress(this.video.nativeElement?.buffered?.end(this.video.nativeElement?.buffered?.length - 1));
      // console.warn('amit4 ', this.video.nativeElement.buffered.end(0))
    },
    timeupdate: () => {
      this.syncAudioWithVideo();
      if (!this.ignore) {
        this.videoTimeService.setVideoProgress(this.video.nativeElement.currentTime);
      }
      if (
        this.video.nativeElement.currentTime === this.video.nativeElement.duration &&
        this.video.nativeElement.duration > 0
      ) {
        this.videoService.pause();
        this.videoService.setVideoEnded(true);
      } else {
        this.videoService.setVideoEnded(false);
      }
    }
  };

  @ViewChild('video', { static: true }) private video!: ElementRef<HTMLVideoElement>;

  constructor(
    private videoService: VideoService,
    private volumeService: VolumeService,
    private videoTimeService: VideoTimeService,
    private videoPlaybackService: VideoPlaybackService,
    private videoPlaylistService: VideoPlaylistService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  public ngOnInit() {
    this.vid_player = document.querySelector('.video-container');
    // this.refreshPlayer(this.videoUrl);
    this.createPlayer();
  }

  // loadedVideo() {
  //   alert('loaded');
  //   this.videoService.play();
  //   this.isPaused = true;
  //   this.time = 0;
  //   this.videoWatchContentEvent(this.videoData);
  //   this.timeUpdateFunction();
  //   this.startCounter();
  // };

  // loadedVideo() {
  //   alert('loaded');
  //   // this.isPaused = true;
  //   // this.time = 0;
  //   // this.videoWatchContentEvent(this.videoData);
  //   // this.timeUpdateFunction();
  //   // this.startCounter();
  // };


  createPlayer() {
    // this.hls = new Hls();
    // this.videoListeners = {
    //   loadedmetadata: () => this.videoTimeService.setVideoDuration(this.video.nativeElement.duration),
    //   canplay: () => this.videoService.setLoading(false),
    //   seeking: () => this.videoService.setLoading(true),
    //   waiting: () => this.videoService.setLoading(true),
    //   playing: () => this.videoService.play(),
    //   loop: () => this.videoService.setVideoLoop(false),
    //   Buffer: () => this.videoService.setLoading(true),
    //   timeupdate: () => {
    //     if (!this.ignore) {
    //       this.videoTimeService.setVideoProgress(this.video.nativeElement.currentTime);
    //     }
    //     if (
    //       this.video.nativeElement.currentTime === this.video.nativeElement.duration &&
    //       this.video.nativeElement.duration > 0
    //     ) {
    //       this.videoService.pause();
    //       this.videoService.setVideoEnded(true);
    //     } else {
    //       this.videoService.setVideoEnded(false);
    //     }
    //   }
    // };
    // this.load(data);
    this.subscriptions();
    Object.keys(this.videoListeners).forEach(videoListener =>
      this.video.nativeElement.addEventListener(videoListener, this.videoListeners[videoListener])
    );
    // this.videoService.play();

    this.video?.nativeElement.addEventListener('mousemove', this.showControls.bind(this));
    // this.video?.nativeElement.addEventListener('mouseleave', this.hideControls.bind(this));
    // document.querySelector('.video-controls')?.addEventListener('mouseenter', this.showControls.bind(this));
    // document.querySelector('.video-app')?.addEventListener('mouseenter', this.hideControls.bind(this));
    // document.addEventListener('keyup', this.keyboardShortcuts.bind(this));

    document.addEventListener('keyup', (event: any) => {
      // Check if the key press happened inside an input field
      if (event.target.tagName.toLowerCase() !== 'input') {
        this.keyboardShortcuts(event);
      }
    });

    // document.addEventListener('keyup', this.keyboardShortcuts.bind(this));
    // this.video?.nativeElement.addEventListener('click', this.animatePlayback.bind(this));
  }

  /** Play/Pause video on click */
  public onVideoClick() {
    // alert('hihi');
    if (this.playing) {
      this.videoService.pause();
    } else {
      this.videoService.play();
    }
  }

  /** Go full screen on double click */
  public onDoubleClick() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      const videoPlayerDiv = document.querySelector('.video-player-inner');
      videoPlayerDiv?.requestFullscreen();
      this.vid_player?.classList.remove('mini-player');
    }
  }

  /**
   * Loads the video, if the browser supports HLS then the video use it, else play a video with native support
   */
  public load(currentVideo: string): void {
    if (isPlatformBrowser(this.platformId)) {
      // console.table(currentVideo);
      if (typeof Hls !== 'undefined' && this.hls) {
        this.destroyPlayer();
      }

      if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        this.hls = new Hls();
        // this.hls = new Hls(this.config);
        this.loadVideoWithHLS(currentVideo);
      } else {
        if (this.video.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
          this.loadVideo(currentVideo);
        }
      }
    } else {
      console.error('HLS.js is not available or not supported in this environment');
    }

  }

  /**
   * Play or Pause current video
   */
  private playPauseVideo(playing: boolean) {
    this.playing = playing;
    this.video.nativeElement[playing ? 'play' : 'pause']();
    if (playing) {
      this.vid_player?.classList.add('vid-playing-mode');
      this.vid_player?.classList.remove('vid-pause-mode');
      this.showControls();
    } else {
      this.vid_player?.classList.add('vid-pause-mode');
      this.vid_player?.classList.remove('vid-playing-mode');
    }
  }

  setVolumeFun(volume: any) {
    if (this.audioElements.length) {
      const currentTime = this.video.nativeElement.currentTime;
      this.audioElements.forEach((audioElement, index) => {
        this.audioTracks[index].volume = volume;
        audioElement.currentTime = currentTime;
        audioElement.volume = volume;
      });
    } else {
      this.video.nativeElement.volume = volume;
    }
  }

  setPlaybackFun(playback: any) {
    this.video.nativeElement.playbackRate = playback;
    if (this.audioElements.length) {
      const currentTime = this.video.nativeElement.currentTime;
      this.audioElements.forEach(audioElement => {
        audioElement.currentTime = currentTime;
        audioElement.playbackRate = playback;
      });
    } else {
      // this.video.nativeElement.playbackRate = playback
    }
  }

  /**
   * Setup subscriptions
   */
  private subscriptions() {
    const a = this.videoService.playingState$.subscribe(playing => this.playPauseVideo(playing));
    const b = this.videoPlaylistService.currentVideo$.subscribe(video => this.load(video));
    const c = this.videoTimeService.currentTime$.subscribe(currentTime => (this.video.nativeElement.currentTime = currentTime));
    const d = this.volumeService.volumeValue$.subscribe(volume => (this.setVolumeFun(volume)));
    const e = this.videoService.loading$.subscribe(loading => (this.loading = loading));
    const f = this.videoService.videoLoop$.subscribe(loop => (this.video.nativeElement.loop = loop));
    const g = this.videoService.forwardValue$.subscribe(forward => this.onForward(forward));
    const h = this.videoService.backwardValue$.subscribe(backward => this.onBackward(backward));
    const i = this.videoTimeService.ignore$.subscribe(ignore => (this.ignore = ignore));
    const j = this.videoPlaybackService.playbackValue$.subscribe(playback => (this.setPlaybackFun(playback)));
    const k = this.videoPlaylistService.videoPlayerData$
      .subscribe(
        videoData => (this.videoData = videoData)
      );
    const l = this.videoPlaybackService.qualityValue$.subscribe(quality => this.setBitrate(quality));
    const m = this.videoPlaybackService.audioValue$.subscribe(audio => this.setAudioTrack(audio));
    const n = this.videoPlaybackService.subtitleValue$.subscribe(subtitle => this.setSubtitleTrack(subtitle));


    this.subscriptionList.push(a, b, c, d, e, f, g, h, i, j, k, l, m, n);
    this.videoService.isPlayerActive$
      .subscribe(
        isPlayerActive => {
          if ((!isPlayerActive?.playerActive && !isPlayerActive?.miniPlayerActive)) {
            this.destroyPlayer();
            // this.subscription.unsubscribe();
            this.subscriptionList.forEach((subscription) => subscription.unsubscribe())
          } else {
            // do nothing
          }
        }
      );

  }

  /**
   * Method that loads the video with HLS support
   */
  private loadVideoWithHLS(currentVideo: string) {
    // this.hls.loadSource(currentVideo);
    this.hls.attachMedia(this.video.nativeElement);
    // this.videoService.play();
    // this.hls.on(Hls.Events.MANIFEST_PARSED, () => this.video.nativeElement.play());
    this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {

      //hls.loadLevel = 3;

      this.hls.loadSource(currentVideo);

      this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        // console.warn("manifest loaded", data);
        this.video.nativeElement.volume = 1;
        // console.warn(this.hls.levels, this.hls.currentLevel, this.hls.loadLevel, this.hls.levels[this.hls.loadLevel]);
        // this.hls.currentLevel = 0;

        const subtitleTracks = data?.subtitleTracks;
        this.hls.subtitleDisplay = true;
        // Assuming you have a way to select a subtitle track, e.g., by index
        const selectedSubtitleTrackIndex = 0;
        this.hls.subtitleTrack = selectedSubtitleTrackIndex;

        const videoList = [];

        videoList.push({
          qualityIndex: 0,
          width: 0,
          height: 0,
          bitrate: 0,
          mediaType: 'video',
          label: 'AUTO',
        });
        // Define the resolution dictionary
        const resolutions = { 2160: '4K', 1080: 'Full HD', 720: '720p', 480: '480p', 360: '360p' };

        data.levels.forEach(
          (
            item: { width: any; height: any; bitrate: any; name: any },
            index: number
          ) => {
            videoList.push({
              qualityIndex: ++index,
              width: item.width,
              height: item.height,
              bitrate: item.bitrate,
              mediaType: 'video',
              label: resolutions[item.height] ? resolutions[item.height] : `${item.height}p`,
            });
          }
        );

        this.onGetBitrates.emit(videoList);

        this.onGetSubtitleTracks.emit(subtitleTracks);
      });

      this.hls.on(Hls.Events.LEVEL_SWITCHING, (event, data) => {
        // console.warn('LEVEL_SWITCHING', data);
      });

      this.hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (event, data) => {
        // console.warn('SUBTITLE_TRACKS_UPDATED', data);
        data.subtitleTracks.forEach(track => {
          this.hls.subtitleTrack = track.id;
        });
      });

      this.hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (event, data) => {
        // console.warn('SUBTITLE_TRACK_SWITCH', data);
      });

      let isBufferCodecsHandled = false;
      this.hls.on(Hls.Events.BUFFER_CODECS, (event, data) => {
        // console.warn('LEVEL_SWITCHING', data, this.hls.audioTracks);
        // audio tracks
        if (!isBufferCodecsHandled) {
          this.audioTracks = this.hls.audioTracks.filter(track => track.name !== 'Mix' && track.name !== 'Default');
          // console.warn('testing Tracks', this.audioTracks);
          this.audioTracks.forEach(track => {
            track.volume = 1;
            track.soloed = false;
            track.muted = false;
            track.isOpen = false;
            // Check if an audio element for this track URL already exists
            const existingAudioElement = this.audioElements.find(element => element.getAttribute("name") === track.name);
            if (!existingAudioElement) {
              // If it doesn't exist, create a new audio element
              const audioElement = this.createAudioElement(track);
              audioElement.currentTime = this.video.nativeElement.currentTime; // Sync with video currentTime
              audioElement.volume = 1;
              audioElement.pause();
              this.audioElements.push(audioElement);
            }
          });

          this.onGetAudioTracks.emit(this.audioTracks);
          isBufferCodecsHandled = true;
        } else { }

      });

    });

    this.video.nativeElement.play();
  }

  checkCurrentTime() {
    return this.audioElements[0]?.currentTime;
  }

  // syncAudioWithVideo() {
  //   if(this.audioElements.length) {
  //     const currentTime = this.video.nativeElement.currentTime;
  //     const audioCurrentTime = this.checkCurrentTime();

  //     if (Math.round(currentTime) > Math.round(audioCurrentTime)) {
  //       this.audioElements.forEach(audioElement => {
  //         audioElement.currentTime = currentTime;
  //         if (this.video.nativeElement.paused || this.video.nativeElement.readyState < 3) {
  //           audioElement.pause();
  //         } else {
  //           this.video.nativeElement.volume = 0;
  //           audioElement.playbackRate = this.video.nativeElement.playbackRate;
  //           audioElement.play();
  //         }
  //       });
  //     }
  //   } else {
  //     this.video.nativeElement.volume = 1;
  //   }
  // }

  syncAudioWithVideo() {
    const videoCurrentTime = this.video.nativeElement.currentTime;
    this.audioElements.forEach(audioElement => {
      const syncThreshold = 0.1; // You can adjust the threshold to be more or less sensitive
      const timeDifference = Math.abs(audioElement.currentTime - videoCurrentTime);

      if (timeDifference > syncThreshold) {
        audioElement.currentTime = videoCurrentTime;
      }

      if (this.video.nativeElement.paused || this.video.nativeElement.readyState < 3) {
        audioElement.pause();
      } else {
        this.video.nativeElement.volume = 0; // Mute video if audio is playing
        audioElement.playbackRate = this.video.nativeElement.playbackRate;
        audioElement.play();
      }
    });

    if (!this.audioElements.length) {
      this.video.nativeElement.volume = this.video.nativeElement.volume; // Restore volume if there are no audio tracks
    }
  }

  pauseAudio() {
    this.audioElements.forEach(audioElement => {
      audioElement.pause();
    });
  }

  // clearAudioTracks() {
  //   console.warn(this.audioElements);
  //   // this.audioHls.stopLoad();
  //   // this.audioHls.destroy();
  //   // this.audioHls = null;
  //   if(this.audioElements.length) {
  //     this.audioElements.forEach(audioElement => {
  //       audioElement.remove();
  //       audioElement.pause();
  //     });
  //   }
  //   console.warn(this.audioElements);
  // }

  setBitrate(bitrate: any) {
    if (this.hls) {
      // console.warn(bitrate);
      this.hls.nextLevel = bitrate.qualityIndex - 1;
      // console.warn(bitrate, this.hls.nextLevel);
    }
  }

  setAudioTrack(audio: any) {
    if (audio?.action === 'mute') {
      this.audioTrackMuteFun(audio);
    } else if (audio?.action === 'solo') {
      this.audioTrackSoloFun(audio);
    } else if (audio?.action === 'volume') {
      this.audioTrackVolumeFun(audio);
    } else if (audio?.isOpen === true || audio?.isOpen === false) {
      this.onMixerEvent(audio);
    } else {
      // Do nothing
    }
  }

  onMixerEvent(data: any) {
    // console.warn(data);
    // if(data.isOpen){
    //   this.videoService.pause();
    //   this.audioTracks.forEach(element => {
    //     if(element.muted && !element.soloed) {
    //       const audioElement = this.audioElements.find(e => e.getAttribute("name") === element.url);
    //       audioElement.volume = 0;
    //       // audioElement.currentTime = this.video.nativeElement.currentTime; // Sync with video currentTime
    //       // audioElement.pause();
    //     } else if (!element.muted && element.soloed) {
    //       const audioElement = this.audioElements.find(e => e.getAttribute("name") === element.url);
    //       audioElement.volume = 1;
    //       // audioElement.currentTime = this.video.nativeElement.currentTime; // Sync with video currentTime
    //       if(audioElement && audioElement.paused){
    //         audioElement.play();
    //       } else {
    //         // Do nothing
    //       }
    //     } else {
    //       // do play all audio tracks
    //       const audioElement = this.audioElements.find(e => e.getAttribute("name") === element.url);
    //       audioElement.volume = 1;
    //       // audioElement.currentTime = this.video.nativeElement.currentTime; // Sync with video currentTime
    //       if(audioElement && audioElement.paused){
    //         audioElement.play();
    //       } else {
    //         // Do nothing
    //       }
    //     }
    //   })
    // } else {
    //   this.videoService.play();
    //   this.audioElements.forEach(audioElement => {
    //     audioElement.volume = 0;
    //     // audioElement.currentTime = this.video.nativeElement.currentTime; // Sync with video currentTime
    //     // audioElement.pause();
    //   });
    // }
  }

  audioTrackMuteFun(track: any) {
    // console.warn(this.audioTracks, track);


    if (track.muted) {
      this.audioTracks.forEach(element => {
        if (element.muted && !element.soloed) {
          const audioElement = this.audioElements.find(e => e.getAttribute("name") === element.name);
          audioElement.volume = 0;
          // audioElement.currentTime = this.video.nativeElement.currentTime; // Sync with video currentTime
          // audioElement.pause();
        } else {
          // do nothing
          const audioElement = this.audioElements.find(e => e.getAttribute("name") === element.name);
          audioElement.volume = 1;
          // audioElement.currentTime = this.video.nativeElement.currentTime;
          // if(audioElement && audioElement.paused){
          //   audioElement.play();
          // } else {
          //   // Do nothing
          // }
        }
      })
    } else {
      // console.error(track);
      const audioElement = this.audioElements.find(e => e.getAttribute("name") === track.name);
      audioElement.volume = 1;
      // audioElement.currentTime = this.video.nativeElement.currentTime; // Sync with video currentTime
      // if(audioElement && audioElement.paused){
      //   audioElement.play();
      // } else {
      //   // Do nothing
      // }
    }
  }
  audioTrackSoloFun(track: any) {
    // console.warn(this.audioTracks, track);
    if (track.soloed) {
      this.audioTracks.forEach(element => {
        if (!element.muted && element.soloed) {
          const audioElement = this.audioElements.find(e => e.getAttribute("name") === element.name);
          audioElement.volume = 1;
          // audioElement.currentTime = this.video.nativeElement.currentTime; // Sync with video currentTime
          // if(audioElement && audioElement.paused){
          //   audioElement.play();
          // } else {
          //   // Do nothing
          // }
        } else {
          // do nothing
          const audioElement = this.audioElements.find(e => e.getAttribute("name") === element.name);
          audioElement.volume = 0;
          // audioElement.pause();
        }
      })
    } else {
      // console.error(track);
      const audioElement = this.audioElements.find(e => e.getAttribute("name") === track.name);
      audioElement.volume = 0;
      // audioElement.currentTime = this.video.nativeElement.currentTime; // Sync with video currentTime
      // audioElement.pause();
    }
  }

  audioTrackVolumeFun(track: any) {
    // Find the audio element corresponding to the specified track
    const audioElement = this.audioElements.find(element => element.getAttribute("name") === track.name);

    if (audioElement) {
      // Set the volume for the specified audio element
      audioElement.volume = track.volume;
      // console.warn(`Volume set for ${track.name}: ${track.volume}`);
    } else {
      // console.error(`Audio element not found for ${track.name}`);
    }
  }

  // createAudioElement(track: any): HTMLAudioElement {
  //   const audioElement = new Audio();
  //   // audioElement.preload = 'auto';
  //   // audioElement.src = url;
  //   this.audioHls = new Hls();

  //   if (Hls.isSupported()) {
  //     this.audioHls.loadSource(track.url);
  //     this.audioHls.attachMedia(audioElement);

  //   } else if (audioElement.canPlayType('application/vnd.apple.mpegurl')) {
  //     // Use native HLS support if available (Safari)
  //     audioElement.src = track.url;
  //   } else {
  //     console.error('HLS is not supported in this browser.');
  //   }
  //   audioElement.preload = 'auto';
  //   audioElement.setAttribute('name', track.name);
  //   return audioElement;
  // }

  //   createAudioElement(track: any): HTMLAudioElement {
  //     const audioElement = new Audio();

  //     // Load the audio track based on the supported method (HLS or native)
  //     if (Hls.isSupported()) {
  //         this.audioHls = new Hls();
  //         this.audioHls.loadSource(track.url);
  //         this.audioHls.attachMedia(audioElement);
  //     } else if (audioElement.canPlayType('application/vnd.apple.mpegurl')) {
  //         // Use native HLS support if available (Safari)
  //         audioElement.src = track.url;
  //     } else {
  //         console.error('HLS is not supported in this browser.');
  //     }

  //     audioElement.preload = 'auto';
  //     audioElement.setAttribute('name', track.name);
  //     return audioElement;
  // }

  createAudioElement(track: any): HTMLAudioElement {
    const audioElement = new Audio();
    // audioElement.preload = 'auto';
    // audioElement.src = url;

    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      const audioHls = new Hls();
      audioHls.loadSource(track.url);
      audioHls.attachMedia(audioElement);

    } else {
      if (audioElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Use native HLS support if available (Safari)
        audioElement.src = track.url;
      }
      else {
        console.error('HLS is not supported in this browser.');
      }
    }
    audioElement.preload = 'auto';
    audioElement.setAttribute('name', track.name);
    return audioElement;
  }

  setSubtitleTrack(subtitle) {
    if (this.hls) {
      // Check if the subtitle is defined and has a valid ID
      if (subtitle && subtitle.id >= 0) {
        // Enable subtitle display for the specified track
        this.hls.subtitleDisplay = true;
        // Set the subtitle track to the specified index
        this.hls.subtitleTrack = subtitle.id;
      } else {
        // If subtitle is not defined or has an invalid ID, disable subtitle display
        this.hls.subtitleDisplay = false;
      }
    }
  }

  /**
   * Method that loads the video without HLS support
   */
  private loadVideo(currentVideo: string) {
    this.video.nativeElement.src = currentVideo;
  }


  keyboardShortcuts(event: any) {
    const { key } = event;
    event.preventDefault();
    // console.log(event);
    switch (key) {
      case 'k':
        this.onVideoClick();
        // this.togglePlay();
        // this.animatePlayback();
        if (this.video.nativeElement.paused) {
          this.showControls();
        } else {
          // setTimeout(() => {
          //   this.hideControls();
          // }, 3000);
        }
        break;
      case 'm':
        // this.toggleMute();
        break;
      case 'f':
        this.onDoubleClick();
        break;
      case ' ':
        this.onVideoClick();
        break;
      case 'p':
        // togglePip();
        break;
      case 'ArrowRight':
        this.onForward(true);
        break;
      case 'ArrowLeft':
        this.onBackward(true);
        break;
      case 'ArrowUp':
        this.onVolumeUp();
        break;
      case 'ArrowDown':
        this.onVolumeDown();
        break;
    }
  }



  showControls() {
    // alert(this.video?.nativeElement?.onplaying);
    // if (this.video?.nativeElement?.paused) {
    //   return;
    // } 

    this.vid_player?.classList.add('hidden-controls');
    clearTimeout(this.timeoutID);

    this.timeoutID = setTimeout(() => {
      this.hideControls();
    }, 3000);
  }

  hideControls() {
    this.vid_player?.classList.remove('hidden-controls');
  }

  onForward(forward: boolean) {
    if (forward) {
      let videoCurrentTime = this.video.nativeElement.currentTime;
      this.video.nativeElement.currentTime = videoCurrentTime + 10;
    } else {

    }
  }

  onBackward(backward: boolean) {
    if (backward) {
      let videoCurrentTime = this.video.nativeElement.currentTime;
      this.video.nativeElement.currentTime = videoCurrentTime - 10;
    } else {

    }
  }

  onVolumeUp() {
    let videoCurrentVolume = this.video.nativeElement.volume;
    if (videoCurrentVolume < 1) {
      this.volumeService.setVolumeValue(videoCurrentVolume + 0.1 ?? 1);
    }
  }

  onVolumeDown() {
    let videoCurrentVolume = this.video.nativeElement.volume;
    if (videoCurrentVolume > 0.1) {
      this.volumeService.setVolumeValue(videoCurrentVolume - 0.1 ?? 1);
    }
  }



  destroyPlayer() {
    if (this.hls) {
      this.videoService.pause();
      this.hls.stopLoad();
      this.hls.destroy();
      this.hls = null;
    }


    // Remove event listeners
    // Object.keys(this.videoListeners).forEach(videoListener => {
    //   this.video.nativeElement.removeEventListener(videoListener, this.videoListeners[videoListener]);
    // });


    // if (this.audioHls) {
    //   this.audioHls.stopLoad();
    //     this.audioHls.destroy();
    //     this.audioHls = null;
    // }

    if (this.audioElements.length) {
      this.audioElements.forEach(audioElement => {
        audioElement.pause(); // Pause the audio element first
        audioElement.remove(); // Remove the audio element from the DOM
      });
      this.audioElements = []; // Reset the array of audio elements
    }

  }

  ngOnDestroy() {
    this.destroyPlayer();
    delete this.hls;
    // delete this.audioHls;
  }


}
