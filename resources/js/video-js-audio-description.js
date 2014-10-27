/**
 * audioDescription plugin
 *
 * @author Erik Haandrikman - Alternet Internet
 * @param options {object}
 */

videojs.plugin('audioDescription',function(options){
var AG = {
        _audioElement:{},
        _videoElement:{},
        _audioDescriptionEnabled:false,
        _isVideoPlaying:false,
        _muted:false,

        init:function(options){
            AG.createAGButton();
        },

        /**
         * Creates html5 audio element
         * and sets the audiosource
         *
         * @param {String} audioSource - (mp3,midi,wav)
         *
         */

        createAudioElement:function(audioSource){
            AG._audioElement=document.createElement("audio");
            AG._audioElement.setAttribute("src",audioSource);
            AG._audioElement.setAttribute("controls","true");
            document.body.appendChild(AG._audioElement);
        },

        /**
         * find the connected audio element
         *
         */

        setAudioElement:function(id){
            AG._audioElement=document.getElementById("audio_"+id);
        },


        /**
         * Creates AG button and append it
         * to the controlbar
         *
         */

        createAGButton:function(){
            videojs.audioDescription = videojs.Button.extend({
                init: function(player, options){
                    videojs.Button.call(this, player, options);
                    this.on('keydown', this.onClick);
                }
            });

            videojs.audioDescription.prototype.onClick = function(e) {

                /**
                 * 0 = no keyCode alias click
                 * undefined = no keycode for FF
                 * 13 = enter
                 */

                if(e.which == 0 || e.which == 13 || e.which==undefined){
                    AG._audioDescriptionEnabled = AG._audioDescriptionEnabled === true ? false : true;
                    AG.AGStateChanged(AG._audioDescriptionEnabled);
                }
            };

            var createaudioDescriptionButton = function() {
                var props = {
                    className: 'vjs-audiodescription-button vjs-control',
                    innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">Audio Guidance</span></div>',
                    role: 'button',
                    tabIndex: 0,
                    'aria-live': 'polite'
                };
                return videojs.Component.prototype.createEl(null, props);
            };

            var audioDescription;
            videojs.plugin('audioDescriptionControlButton', function() {
                var options = { 'el' : createaudioDescriptionButton() };
                audioDescriptionControlButton = new videojs.audioDescription(this, options);
                this.controlBar.el().appendChild(audioDescriptionControlButton.el());
            });
        },

        AGStateChanged:function(state){
            if(state){
                AG.synchronizeAudio(AG._videoElement.currentTime());
                AG.setVolume(AG._videoElement.volume());
                if(AG._isVideoPlaying){
                    AG.play();
                }
            }else{
                console.log("pause");
                AG.pause();
            }
        },

        setVideoElement:function(el){
            AG._videoElement=el;
        },

        play:function(){
            AG._audioElement.play();
            AG._isVideoPlaying=true;
        },

        pause:function(){
            AG._audioElement.pause();

        },

        synchronizeAudio:function(sec){
            AG._audioElement.currentTime=sec;
        },

        setVolume:function(vol){
            if(AG._muted){
                vol=0;
            }
            AG._audioElement.volume=vol;
        }
    };


    // init video & audio
    AG.setVideoElement(this);
    AG.setAudioElement(this.id_);
    AG.init(options);

    // events
    this.on('play',function(){
        AG._isVideoPlaying=true;
        if(AG._audioDescriptionEnabled){
            AG.play();
            AG.synchronizeAudio(this.currentTime());
        }
    });

    this.on('pause',function(){
        AG._isVideoPlaying=false;
        if(AG._audioDescriptionEnabled){
            AG.pause();
        }
    });

    this.on('volumechange',function(){
        if(AG._audioDescriptionEnabled){
            AG._muted=this.muted();
            AG.setVolume(this.volume());
        }
    });
});

