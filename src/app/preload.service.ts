import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PreloadService {
    private renderer: Renderer2;

    constructor(rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);
    }

    preloadImage(src: string): void {
        const link = this.renderer.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        this.renderer.appendChild(document.head, link);
    }
}
