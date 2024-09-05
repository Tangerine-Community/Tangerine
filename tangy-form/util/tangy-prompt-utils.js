/*
 * Tangy Form Prompt Utilitites
 *
 * This class is used to queue up and play prompts for Tangy Forms. 
 * A prompt is an audio file and transitory visual cue associated with
 * a tangy-input or tangy-input option. The prompts are queued and then played in the order
 * defined in the tangy-form-item on-open property or can be triggered
 * ad-hoc from within other form logic.
 * 
 * Each tangy-form-item section has its own queue. The queue is cleared
 * when the section is no longer visible, (due to a 'back', 'next', or 'submit'
 * button click).
 * 
 * Further functionality to control audio is available using (howler.js)[https://www.npmjs.com/package/howler]
 */

export class TangyPromptUtils {

    constructor() {
        this.prompts = []
    }    

    queue(input, audioPath, id=null, clean = false) {

        id = id || input.name

        if (!this.prompts || clean) this.prompts = []

        var audio = new Audio(audioPath);
        audio.preload = 'metadata';
        this.prompts.push({
            input: input,
            sound: audio,
            id: id
        })
    }

    stopAndClearQueue() {
        if (this.prompts.length == 0) { 
            return;
        }

        this.prompts.forEach(prompt => {
            prompt.sound.pause()
            prompt.sound.currentTime = 0
        })

        this.prompts = []
    }

    play(times = 1, multiple = false) {
        this.prompts.forEach(prompt => {
            if (!multiple)
                prompt.sound.pause()
            prompt.sound.currentTime = 0
        })
        var durationTotal = 0
        var thisSound = ''
        thisSound = this.prompts[this.prompts.length - times].sound;

        thisSound.eleId = this.prompts[this.prompts.length - times].id
        thisSound.elePos = times
        this.prompts[this.prompts.length - times].sound.currentTime = 0

        var duration = 0
        thisSound.play()
        duration = (thisSound.duration) * 1000;
        durationTotal += duration
        if (thisSound.eleId.length != 1) {
            this.showDuration(thisSound.eleId)
        } else {
            this.showOptionDuration(thisSound.eleId)
        }
        
        thisSound.onended = this.onSoundEnded.bind(this);
    }

onSoundEnded(event) {
    this.hideDuration(event.target.eleId)
    this.hideOptionDuration(event.target.eleId)

    let times = event.target.elePos
    if (times > 1) {
        this.play(times - 1, true)
    }

    // Remove this sound
    this.prompts.shift();
}

showDuration(id) {
    let prompt = this.prompts.find(input => input.id == id);
    let input = prompt.input;
    if (input) {
        let label = input.shadowRoot.querySelector('label');
        if (label) {
            label.style.borderColor = 'var(--accent-color, #ff620c)';
            label.style.opacity = '1';
        }
    }
};


hideDuration(id) {
    let prompt = this.prompts.find(prompt => prompt.id == id);
    let input = prompt.input;
    if (input) {
        let label = input.shadowRoot.querySelector('label');
        if (label) {
            label.style.borderColor = '';
            label.style.opacity = '1';
        }
    }
};

showOptionDuration(id) {
    let prompt = this.prompts.find(prompt => prompt.id == id);
    let input = prompt.input;
    if (input) {
        //the calling ID
        input.forEach(x => {
            x.style.border = 'solid 5px #ff620c';
            x.style.boxSizing = 'border-box';
        })

        try {
            const siblings = input.getRootNode().host.shadowRoot.querySelectorAll('tangy-radio-block') || [];
            //the rest of the elements on this input
            siblings.forEach(x => x.style.opacity = '0.5')
        } catch (e) {
        }
    }
};

hideOptionDuration(id) {
    let prompt = this.prompts.find(prompt => prompt.id == id);
    let input = prompt.input;
    if (input) {
        try {
            const siblings = input.getRootNode().host.shadowRoot.querySelectorAll('tangy-radio-block') || [];
            siblings.forEach(x => {
                x.style.borderColor = 'transparent';
                x.style.border = 'none'
                x.style.opacity = '1';
            })
        } catch (e) {
        }
    }
};


}
