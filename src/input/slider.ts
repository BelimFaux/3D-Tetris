import * as ui from '../ui.js';

/**
 * Handles events from the sliders for the shader coefficients
 */
export class Slider {
    ambientSlider;
    diffuseSlider;
    specularSlider;

    /**
     * Construct a new Slider
     *
     * This will listen for input on the 'ambientCoefficient', 'diffuseCoefficient' and 'specularCoefficient' sliders
     */
    constructor() {
        this.ambientSlider = document.getElementById(
            'ambientCoefficient',
        ) as HTMLInputElement;
        this.diffuseSlider = document.getElementById(
            'diffuseCoefficient',
        ) as HTMLInputElement;
        this.specularSlider = document.getElementById(
            'specularCoefficient',
        ) as HTMLInputElement;

        this.ambientSlider.addEventListener('input', (ev) => {
            this.coefficientSlider('ambientOutput', ev);
        });

        this.diffuseSlider.addEventListener('input', (ev) => {
            this.coefficientSlider('diffuseOutput', ev);
        });

        this.specularSlider.addEventListener('input', (ev) => {
            this.coefficientSlider('specularOutput', ev);
        });
    }

    /**
     * Return the current value for the ambient coeffient
     */
    getAmbientCoefficient(): number {
        return this.ambientSlider.valueAsNumber;
    }

    /**
     * Return the current value for the diffuse coeffient
     */
    getDiffuseCoefficient(): number {
        return this.diffuseSlider.valueAsNumber;
    }

    /**
     * Return the current value for the specular coeffient
     */
    getSpecularCoefficient(): number {
        return this.specularSlider.valueAsNumber;
    }

    /**
     * handler to update the values of the sliders in the ui
     */
    private coefficientSlider(uielem: string, ev: Event): void {
        const value = (ev.target as HTMLInputElement).value;
        ui.setValue(uielem, value);
    }
}
