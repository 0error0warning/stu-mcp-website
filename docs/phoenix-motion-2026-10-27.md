# Phoenix interaction verification — 2026-10-27

Scope: local website only. No deployment or server changes in this pass.

## Implementation

- Fourteen independent clickable regions: body, tail, both wings, crest, both feet, both eyes, beak, both brows and both cheeks. Hit regions follow their anatomical groups. Pointer hover/click outlines and native SVG title tooltips removed; keyboard focus remains visible.
- A bounded spring solver owns position and velocity per joint. New intentions preserve both; independent joints can act concurrently. Rapid input increases bounded amplitude, with slightly varied tempo. Presets describe targets, not directly applied animation frames. Higher-priority input interrupts idle intentions.
- Continuous shared torso/feet hierarchy, overlapping wing/tail/crest roots, fixed per-feature facial anchors. Whole-body squash/hop does not detach feet.
- Left wing makes a breeze that rocks the document and lifts the envelope; beak/right wing answer the conversation bubble. Idle repertoire includes gaze, preening, stretches, shuffle, tail swish, blink/wink, scene gestures, yawn and sleep/wake.
- Spring RAF sleeps after settlement, pauses offscreen/background, and respects reduced motion. Independent CSS breathing/blinking remain ambient; no physics engine added.

## Checks actually run

Chrome through Playwright CLI on localhost:5173, desktop 1440×1000 and mobile 390×844. All 14 part centers clicked through actual mouse coordinates (moving SVG elements cannot satisfy Playwright's stationary locator check). Each reported the correct target. Rapid right-wing repeat clicks and interleaved part clicks were exercised. Retarget samples retained a nonzero pose rather than resetting to zero. Enter, Space and arrow navigation exercised. Touch-emulated body tap triggered correctly.

Reduced motion: zero running SVG animations and no non-neutral inline joint transform. Mobile horizontal overflow: false. No page exceptions in final desktop/touch checks. Existing older console history includes a favicon.ico 404 and a temporary reference-page 500 from earlier work; these are not final-run results.

Stage screenshots in `docs/qa/phoenix-motion/`: resting, breeze, interrupted, rapid-repeat, mobile and mobile-dark. Inspected resting/breeze/interrupted/repeat captures for joint continuity. These are sampled poses, not proof of every possible pose combination. Touch is emulated, not a physical phone; background-tab lifecycle reviewed in code, not physically switched in final checks.

`node --test tests/*.test.mjs`: 11 passing, including retarget momentum/convergence and rapid reversal/delayed-frame boundedness. `npm run build`: passed.

Final lifecycle check observed asleep → awake after mouse input, data-playing=false after scrolling away, and true on return. Mobile-dark stage also visually inspected.

## 脸颊语义修正验证

2026-10-27：左右触点均映射到 affection；浏览器分别点击左右脸颊后，两侧 cheek=warm、eye=smile，躯干转角分别为正/负，证明方向参数而非单侧表情。1440px 截图已保存并检查；390px 键盘触发双颊一致，无横向溢出，检查期间无 pageerror。减少动态模式切换会取消在途反应；模式稳定后应再触发验证。构建通过。完整后续设计见 `phoenix-character-architecture.md`，拖拽/走动/多视角转身尚未实现。
补查完成：减少动态模式稳定后 Space 触发，双颊均 warm，运行中动画 0；弹簧连续性与限幅两项回归通过。
