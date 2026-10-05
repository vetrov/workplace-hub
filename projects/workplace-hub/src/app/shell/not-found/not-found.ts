import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    imports: [RouterLink],
    template:
        '<div class="state"><p class="eyebrow">404 · Page not found</p><h1>Let’s get you back to work.</h1><p>This page is unavailable. Some workspace sections are still planned.</p><a routerLink="/dashboard">Return to overview →</a></div>',
})
export class NotFound {}
