import * as ui from '../ui.js';

export class Slider {
    ambientSlider;
    diffuseSlider;
    specularSlider;

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

    getAmbientCoefficient(): number {
        return this.ambientSlider.valueAsNumber;
    }

    getDiffuseCoefficient(): number {
        return this.diffuseSlider.valueAsNumber;
    }

    getSpecularCoefficient() {
        return this.specularSlider.valueAsNumber;
    }

    private coefficientSlider(uielem: string, ev: Event) {
        const value = (ev.target as HTMLInputElement).value;
        ui.setValue(uielem, value);
    }
}
