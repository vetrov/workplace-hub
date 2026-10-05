# UI Contract: Safe Navigation and Focus

- canLeave(): boolean returns false while a write is pending, true for an idle pristine form,
  and the native discard-confirmation result for an idle dirty form.
- Successful mutations clear busy before marking pristine/navigating. Failures retain inputs.
- Request and new-asset routes use existing functional CanDeactivate; no new endpoint.
- Main navigation to a different path focuses the newly rendered h1/routed-content fallback. Initial page load,
  query/fragment changes and background HTTP retain focus; feature initial input focus wins.
- Skip to content focuses main. One main landmark, meaningful document title, labeled native
  controls and visible keyboard focus are verified on planned routes.
- Wizard next/back focuses the currently rendered first field or review heading. Invalid
  progression/save focuses the first invalid native control, including a money CVA descendant.
- Reset/identity changes clear drafts and cancel writes; previously scheduled view work must not
  target removed controls. Older/newer Angular form and component contracts remain unchanged.
