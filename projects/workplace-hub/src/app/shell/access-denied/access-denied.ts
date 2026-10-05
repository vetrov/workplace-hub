import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({ imports: [RouterLink], template: '<div class="state"><p class="eyebrow">Restricted access</p><h1>This section needs another role.</h1><p>Choose an appropriate demo identity or return to your overview.</p><a routerLink="/dashboard">Return to overview →</a></div>' })
export class AccessDenied {}
