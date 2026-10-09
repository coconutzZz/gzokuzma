// Copyright (C) 2026 gzokuzma contributors. SPDX-License-Identifier: GPL-3.0-or-later
// A single lazy entry with named exports keeps unused Swiper modules out of the build.
export { register } from 'swiper/element'
export { Navigation, FreeMode } from 'swiper/modules'
export { default as freeModeStyles } from 'swiper/element/css/free-mode?inline'
