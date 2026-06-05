/**
 * Vortex IPTV player logic file
 */

document.addEventListener('DOMContentLoaded', () => {
    // State management
    let channels = [];
    let favorites = JSON.parse(localStorage.getItem('vortex_favorites')) || [];
    let currentCategory = 'Bangla'; // Default starting group
    let searchQuery = '';
    let showFavoritesOnly = false;
    let activeChannel = null;
    let hlsInstance = null;
    let visibleCount = 80;

    // DOM Elements
    const video = document.getElementById('video-player');
    const videoWrapper = document.querySelector('.video-wrapper');
    const channelsGrid = document.getElementById('channels-grid');
    const categoriesList = document.getElementById('categories-list');
    const categoriesListMobile = document.getElementById('categories-list-mobile');
    const mobileCategoriesBar = document.getElementById('mobile-categories-bar');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const favToggleBtn = document.getElementById('fav-toggle-btn');
    const currentCategoryTitle = document.getElementById('current-category-title');
    const channelCountBadge = document.getElementById('channel-count-badge');
    const emptyState = document.getElementById('empty-state');

    // Player Panel DOM Elements
    const playerPanel = document.getElementById('player-panel');
    const closePanelBtn = document.getElementById('close-panel');
    const playBtn = document.getElementById('play-btn');
    const volumeBtn = document.getElementById('volume-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const pipBtn = document.getElementById('pip-btn');
    const theaterBtn = document.getElementById('theater-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const bufferingOverlay = document.getElementById('player-buffering');
    const errorOverlay = document.getElementById('player-error');
    const errorText = document.getElementById('player-error-text');

    // Active Channel Details DOM Elements
    const activeLogo = document.getElementById('active-channel-logo');
    const activeName = document.getElementById('active-channel-name');
    const activeGroup = document.getElementById('active-channel-group');
    const activeStarBtn = document.getElementById('active-star-btn');

    // Mobile Navigation Controls
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const headerSearchBox = document.getElementById('header-search-box');

    // Mobile Bottom Nav Buttons
    const navHome = document.getElementById('nav-home');
    const navCategoriesBtn = document.getElementById('nav-categories-btn');
    const navSearchBtn = document.getElementById('nav-search-btn');
    const navFavsBtn = document.getElementById('nav-favs-btn');

    // Bottom Sheet category picker
    const categoriesSheet = document.getElementById('categories-sheet');
    const sheetBackdrop = document.getElementById('sheet-backdrop');

    // Mappings for pretty icons per category
    const categoryIcons = {
        'all': 'layers',
        'favorites': 'star',
        'bangla': 'tv',
        'indian bangla': 'tv',
        'news': 'globe',
        'sports': 'trophy',
        'kids': 'smile',
        'religious': 'book-open',
        'music': 'music',
        'channels': 'grid',
        'english': 'languages',
        'hindi': 'languages',
        'movie': 'film',
        'drama': 'theater',
        'weather': 'cloud-sun',
        'documentary': 'compass',
        'latest': 'sparkles',
        'other': 'help-circle'
    };

    // Load Channels from Local JSON file
    async function loadChannels() {
        try {
            const response = await fetch('channels.json');
            if (!response.ok) throw new Error('Failed to load channels dataset');
            channels = await response.json();

            // Re-render
            initApp();
        } catch (err) {
            console.error('Error loading IPTV channels:', err);
            emptyState.style.display = 'flex';
            emptyState.querySelector('h3').textContent = 'Database offline';
            emptyState.querySelector('p').textContent = 'Check configuration or ensure channels.json is in workspace.';
        }
    }

    // Initialize application layout
    function initApp() {
        renderCategories();
        renderChannels();
        lucide.createIcons();
    }

    // Process & Render categories in Sidebar, Mobile chips & Bottom Sheet
    function renderCategories() {
        // Collect dynamic groups
        const groupsMap = {};
        channels.forEach(ch => {
            const groupName = ch.group || 'Other';
            groupsMap[groupName] = (groupsMap[groupName] || 0) + 1;
        });

        const sortedGroups = Object.keys(groupsMap).sort((a, b) => a.localeCompare(b));

        let sidebarHtml = '';
        let mobileSheetHtml = '';
        let chipsHtml = '';

        const totalCount = channels.length;
        const favCount = favorites.length;

        // Render Desktop Sidebar Categories List
        sidebarHtml += `
            <li class="category-item ${currentCategory === 'All' && !showFavoritesOnly ? 'active' : ''}" data-category="All">
                <div class="category-item-left">
                    <i data-lucide="layers"></i>
                    <span>All Channels</span>
                </div>
                <span class="category-count">${totalCount}</span>
            </li>
        `;
        sidebarHtml += `
            <li class="category-item ${showFavoritesOnly ? 'active' : ''}" data-category="Favorites">
                <div class="category-item-left">
                    <i data-lucide="star"></i>
                    <span>Bookmarks</span>
                </div>
                <span class="category-count" id="sidebar-fav-count">${favCount}</span>
            </li>
        `;

        // Render Mobile Bottom Sheet Categories List
        mobileSheetHtml += `
            <li class="category-item ${currentCategory === 'All' && !showFavoritesOnly ? 'active' : ''}" data-category="All">
                <div class="category-item-left">
                    <i data-lucide="layers"></i>
                    <span>All Channels</span>
                </div>
                <span class="category-count">${totalCount}</span>
            </li>
        `;
        mobileSheetHtml += `
            <li class="category-item ${showFavoritesOnly ? 'active' : ''}" data-category="Favorites">
                <div class="category-item-left">
                    <i data-lucide="star"></i>
                    <span>Bookmarks</span>
                </div>
                <span class="category-count">${favCount}</span>
            </li>
        `;

        // Render Mobile Top Chips List (All & Bookmarks)
        chipsHtml += `
            <div class="category-chip ${currentCategory === 'All' && !showFavoritesOnly ? 'active' : ''}" data-category="All">
                <i data-lucide="layers" style="width: 14px; height: 14px;"></i>
                <span>All</span>
            </div>
            <div class="category-chip ${showFavoritesOnly ? 'active' : ''}" data-category="Favorites">
                <i data-lucide="star" style="width: 14px; height: 14px;"></i>
                <span>Bookmarks</span>
            </div>
        `;

        // Loop over sorted categories groups
        sortedGroups.forEach(group => {
            const isActive = currentCategory === group && !showFavoritesOnly;
            const iconName = categoryIcons[group.toLowerCase()] || 'tv';

            const groupItemHtml = `
                <li class="category-item ${isActive ? 'active' : ''}" data-category="${group}">
                    <div class="category-item-left">
                        <i data-lucide="${iconName}"></i>
                        <span>${group}</span>
                    </div>
                    <span class="category-count">${groupsMap[group]}</span>
                </li>
            `;

            sidebarHtml += groupItemHtml;
            mobileSheetHtml += groupItemHtml;

            chipsHtml += `
                <div class="category-chip ${isActive ? 'active' : ''}" data-category="${group}">
                    <span>${group}</span>
                </div>
            `;
        });

        // Insert html layouts
        categoriesList.innerHTML = sidebarHtml;
        categoriesListMobile.innerHTML = mobileSheetHtml;
        mobileCategoriesBar.innerHTML = chipsHtml;

        // Sync Bottom Navigation buttons status
        updateMobileNavState();

        // Listeners for Category Selections
        const registerCategoryClicks = (selectors) => {
            document.querySelectorAll(selectors).forEach(item => {
                item.addEventListener('click', () => {
                    const targetCat = item.getAttribute('data-category');

                    if (targetCat === 'Favorites') {
                        showFavoritesOnly = true;
                        currentCategory = 'Favorites';
                    } else {
                        showFavoritesOnly = false;
                        currentCategory = targetCat;
                    }

                    // Reset search input on filter change
                    searchQuery = '';
                    searchInput.value = '';
                    clearSearchBtn.style.display = 'none';
                    headerSearchBox.classList.remove('open');
                    visibleCount = 80;

                    // Close layouts
                    sidebar.classList.remove('open');
                    categoriesSheet.classList.remove('open');

                    // Scroll feed to top on category change
                    const feedSection = document.querySelector('.feed-section');
                    if (feedSection) feedSection.scrollTop = 0;

                    renderCategories();
                    renderChannels();

                    // Auto-scroll active mobile chip into view
                    const activeChip = mobileCategoriesBar.querySelector('.category-chip.active');
                    if (activeChip) {
                        activeChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }

                    lucide.createIcons();
                });
            });
        };

        registerCategoryClicks('.sidebar .category-item');
        registerCategoryClicks('.categories-list-mobile .category-item');
        registerCategoryClicks('.mobile-categories-bar .category-chip');
    }

    // Filter & Render channel list grid
    function renderChannels() {
        let filtered = channels;

        // Apply search query filter or category filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase().trim();
            filtered = channels.filter(ch =>
                ch.name.toLowerCase().includes(query) ||
                (ch.group && ch.group.toLowerCase().includes(query))
            );
            currentCategoryTitle.textContent = `Search results for "${searchQuery}"`;
        } else if (showFavoritesOnly) {
            filtered = channels.filter(ch => favorites.includes(ch.name));
            currentCategoryTitle.textContent = 'Bookmarks';
        } else if (currentCategory !== 'All') {
            filtered = channels.filter(ch => ch.group === currentCategory);
            currentCategoryTitle.textContent = currentCategory;
        } else {
            currentCategoryTitle.textContent = 'All Channels';
        }

        // Update active counts
        channelCountBadge.textContent = `${filtered.length} Channels`;

        if (filtered.length === 0) {
            channelsGrid.innerHTML = '';
            emptyState.style.display = 'flex';
            return;
        }

        emptyState.style.display = 'none';

        // Render card templates using inline SVGs for performance (sliced to visibleCount)
        const sliceToRender = filtered.slice(0, visibleCount);
        channelsGrid.innerHTML = sliceToRender.map((ch, i) => {
            const isFav = favorites.includes(ch.name);
            const favClass = isFav ? 'active' : '';
            const logoUrl = ch.logo && ch.logo.trim() !== '' ? ch.logo : null;
            const isPlaying = activeChannel && activeChannel.name === ch.name;
            const playingClass = isPlaying ? 'now-playing' : '';

            return `
                <div class="channel-card ${playingClass}" data-name="${ch.name}" style="animation-delay: ${Math.min(i * 0.03, 0.6)}s">
                    <button class="card-fav-btn ${favClass}" data-name="${ch.name}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                    <div class="card-logo-container">
                        ${logoUrl
                    ? `<img class="card-logo" src="${logoUrl}" alt="${ch.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
                    : ''
                }
                        <div class="fallback-logo" style="${logoUrl ? 'display: none;' : 'display: flex;'} width: 100%; height: 100%; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--bg-surface-elevated), var(--bg-dark)); font-family: 'Outfit'; font-weight: 700; font-size: 20px; color: var(--text-secondary);">
                            ${ch.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div class="card-play-overlay">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                        </div>
                    </div>
                    <div class="card-info">
                        <h4 class="card-name" title="${ch.name}">${ch.name}</h4>
                        <span class="card-group">${ch.group || 'Other'}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Register action triggers on cards
        document.querySelectorAll('.channel-card').forEach(card => {
            const chName = card.getAttribute('data-name');
            const targetChannel = channels.find(c => c.name === chName);

            card.addEventListener('click', (e) => {
                if (e.target.closest('.card-fav-btn')) return;
                playChannel(targetChannel);
            });

            const favBtn = card.querySelector('.card-fav-btn');
            favBtn.addEventListener('click', () => {
                toggleFavorite(chName);
                favBtn.classList.toggle('active');

                if (showFavoritesOnly) {
                    renderChannels();
                } else {
                    renderCategories(); // Re-render sidebar/bottom sheet counts
                }
            });
        });
    }

    // Toggle items inside browser local storage favorites
    function toggleFavorite(name) {
        const index = favorites.indexOf(name);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(name);
        }
        localStorage.setItem('vortex_favorites', JSON.stringify(favorites));

        if (activeChannel && activeChannel.name === name) {
            updateActivePlayerDetails();
        }
    }

    // Play active HLS streaming video
    function playChannel(channel) {
        if (!channel) return;
        activeChannel = channel;

        playerPanel.classList.add('open');
        updateActivePlayerDetails();

        // Scroll feed to top so the player is visible
        const feedSection = document.querySelector('.feed-section');
        if (feedSection) feedSection.scrollTop = 0;

        // Re-render channels to update now-playing indicator
        renderChannels();

        bufferingOverlay.style.display = 'flex';
        errorOverlay.style.display = 'none';

        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }

        const m3u8Url = channel.url;
        if (Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(m3u8Url);
            hlsInstance.attachMedia(video);

            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(e => console.log("Play action required:", e));
            });

            hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            showPlayerError('Server Offline or Connection Lost');
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hlsInstance.recoverMediaError();
                            break;
                        default:
                            showPlayerError('Feed Unavailable or Blocked');
                            hlsInstance.destroy();
                            break;
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = m3u8Url;
            video.addEventListener('loadedmetadata', () => {
                video.play();
            });
            video.addEventListener('error', () => {
                showPlayerError('Load stream failed');
            });
        } else {
            showPlayerError('HLS streaming not supported');
        }

        document.querySelector('.icon-play').style.display = 'none';
        document.querySelector('.icon-pause').style.display = 'block';
    }

    function showPlayerError(msg) {
        bufferingOverlay.style.display = 'none';
        errorOverlay.style.display = 'flex';
        errorText.textContent = msg;
    }

    function updateActivePlayerDetails() {
        if (!activeChannel) return;

        activeName.textContent = activeChannel.name;
        activeGroup.textContent = activeChannel.group || 'Other';

        const logoUrl = activeChannel.logo && activeChannel.logo.trim() !== '' ? activeChannel.logo : null;
        if (logoUrl) {
            activeLogo.src = logoUrl;
            activeLogo.style.display = 'block';
        } else {
            activeLogo.style.display = 'none';
        }

        const isFav = favorites.includes(activeChannel.name);
        if (isFav) {
            activeStarBtn.classList.add('active');
            activeStarBtn.querySelector('span').textContent = 'Bookmarked';
        } else {
            activeStarBtn.classList.remove('active');
            activeStarBtn.querySelector('span').textContent = 'Add to Favorites';
        }

        lucide.createIcons();
    }

    // Sync Bottom nav button active highlights
    function updateMobileNavState() {
        navHome.classList.remove('active');
        navFavsBtn.classList.remove('active');
        navCategoriesBtn.classList.remove('active');

        if (showFavoritesOnly) {
            navFavsBtn.classList.add('active');
        } else if (currentCategory === 'All') {
            navHome.classList.add('active');
        } else {
            // Home acts as regular browse categories
            navHome.classList.add('active');
        }
    }

    // Search bar listener (with debounce)
    let searchTimeout = null;
    searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val.length > 0) {
            clearSearchBtn.style.display = 'block';
        } else {
            clearSearchBtn.style.display = 'none';
        }

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = val;
            visibleCount = 80; // Reset visible count on new search query
            renderChannels();
        }, 250);
    });

    clearSearchBtn.addEventListener('click', () => {
        searchQuery = '';
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        visibleCount = 80;
        renderChannels();
    });

    // Favorites Desktop Filter Toggle Button
    favToggleBtn.addEventListener('click', () => {
        favToggleBtn.classList.toggle('active');
        showFavoritesOnly = favToggleBtn.classList.contains('active');
        currentCategory = showFavoritesOnly ? 'Favorites' : 'Bangla';

        renderCategories();
        renderChannels();
        lucide.createIcons();
    });

    // Mobile Navigation Controls Event Listeners
    navHome.addEventListener('click', () => {
        showFavoritesOnly = false;
        currentCategory = 'Bangla'; // Reset to default group
        headerSearchBox.classList.remove('open');
        categoriesSheet.classList.remove('open');
        renderCategories();
        renderChannels();
    });

    navCategoriesBtn.addEventListener('click', () => {
        categoriesSheet.classList.add('open');
    });

    navSearchBtn.addEventListener('click', () => {
        headerSearchBox.classList.toggle('open');
        if (headerSearchBox.classList.contains('open')) {
            searchInput.focus();
        }
    });

    navFavsBtn.addEventListener('click', () => {
        showFavoritesOnly = true;
        currentCategory = 'Favorites';
        headerSearchBox.classList.remove('open');
        categoriesSheet.classList.remove('open');
        renderCategories();
        renderChannels();
    });

    // Close Category Bottom Sheet on click backdrop
    sheetBackdrop.addEventListener('click', () => {
        categoriesSheet.classList.remove('open');
    });

    // Close mobile side drawer if user clicks outside
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) &&
            !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });

    // Close player drawer
    closePanelBtn.addEventListener('click', () => {
        playerPanel.classList.remove('open');
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
        video.src = '';
        activeChannel = null;
        renderChannels();
    });

    // Video buffering loaders status
    video.addEventListener('waiting', () => {
        bufferingOverlay.style.display = 'flex';
    });

    video.addEventListener('playing', () => {
        bufferingOverlay.style.display = 'none';
        errorOverlay.style.display = 'none';
    });

    // Active player star action
    activeStarBtn.addEventListener('click', () => {
        if (activeChannel) {
            toggleFavorite(activeChannel.name);
            renderChannels();
        }
    });

    // Video Control actions
    playBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            document.querySelector('.icon-play').style.display = 'none';
            document.querySelector('.icon-pause').style.display = 'block';
        } else {
            video.pause();
            document.querySelector('.icon-play').style.display = 'block';
            document.querySelector('.icon-pause').style.display = 'none';
        }
    });

    volumeBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        if (video.muted) {
            document.querySelector('.icon-vol-up').style.display = 'none';
            document.querySelector('.icon-vol-mute').style.display = 'block';
            volumeSlider.value = 0;
        } else {
            document.querySelector('.icon-vol-up').style.display = 'block';
            document.querySelector('.icon-vol-mute').style.display = 'none';
            volumeSlider.value = video.volume;
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        video.volume = e.target.value;
        if (video.volume == 0) {
            video.muted = true;
            document.querySelector('.icon-vol-up').style.display = 'none';
            document.querySelector('.icon-vol-mute').style.display = 'block';
        } else {
            video.muted = false;
            document.querySelector('.icon-vol-up').style.display = 'block';
            document.querySelector('.icon-vol-mute').style.display = 'none';
        }
    });

    pipBtn.addEventListener('click', async () => {
        try {
            if (video !== document.pictureInPictureElement) {
                await video.requestPictureInPicture();
            } else {
                await document.exitPictureInPicture();
            }
        } catch (err) {
            console.error('Failed to trigger Picture-in-Picture:', err);
        }
    });

    let isOrientationLocked = false;
    fullscreenBtn.addEventListener('click', async () => {
        const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        
        if (!isFullscreen) {
            try {
                if (videoWrapper.requestFullscreen) {
                    await videoWrapper.requestFullscreen();
                    isOrientationLocked = false;
                    if (screen.orientation && typeof screen.orientation.lock === 'function') {
                        await screen.orientation.lock('landscape').then(() => {
                            isOrientationLocked = true;
                        }).catch(err => {
                            console.warn('Screen orientation lock is not supported or was ignored:', err);
                        });
                    }
                    
                    // Fallback to CSS landscape rotation if orientation lock failed/ignored and we are in portrait
                    if (!isOrientationLocked && window.innerHeight > window.innerWidth) {
                        videoWrapper.classList.add('rotate-landscape');
                    }
                } else if (video.webkitEnterFullscreen) {
                    // Native iOS/Safari fallback
                    video.webkitEnterFullscreen();
                } else if (video.requestFullscreen) {
                    await video.requestFullscreen();
                } else {
                    console.error('Fullscreen API is not supported on this device/browser');
                }
            } catch (err) {
                console.error(`Error enabling fullscreen: ${err.message}`);
                // Fallback to native WebKit fullscreen if element-level fullscreen failed
                if (video.webkitEnterFullscreen) {
                    try {
                        video.webkitEnterFullscreen();
                    } catch (e) {
                        console.error('WebKit fallback failed:', e);
                    }
                }
            }
        } else {
            const exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
            if (exitFS) {
                exitFS.call(document);
            }
        }
    });

    // Handle unlocking orientation when exiting fullscreen
    const onFullscreenChange = () => {
        const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        if (!isFullscreen) {
            videoWrapper.classList.remove('rotate-landscape');
            if (screen.orientation && typeof screen.orientation.unlock === 'function') {
                screen.orientation.unlock();
            }
        }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);

    // Watch for physical device rotation to dynamically toggle CSS rotation
    window.addEventListener('resize', () => {
        const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        if (isFullscreen && !isOrientationLocked) {
            if (window.innerWidth > window.innerHeight) {
                videoWrapper.classList.remove('rotate-landscape');
            } else {
                videoWrapper.classList.add('rotate-landscape');
            }
        }
    });

    theaterBtn.addEventListener('click', () => {
        const appContainer = document.querySelector('.app-container');
        appContainer.classList.toggle('theater-mode');
        theaterBtn.classList.toggle('active');
    });

    // Keyboard Hotkey shortcuts
    document.addEventListener('keydown', (e) => {
        if (document.activeElement === searchInput) return;

        if (activeChannel) {
            if (e.code === 'Space') {
                e.preventDefault();
                playBtn.click();
            } else if (e.code === 'KeyM') {
                volumeBtn.click();
            } else if (e.code === 'Escape') {
                closePanelBtn.click();
            }
        }
    });

    // Infinite scroll for channel feed
    let isLoadingMore = false;
    const feedSection = document.getElementById('feed-section');
    if (feedSection) {
        feedSection.addEventListener('scroll', () => {
            if (isLoadingMore) return;
            // If scrolled near the bottom, increase visible count and re-render
            if (feedSection.scrollTop + feedSection.clientHeight >= feedSection.scrollHeight - 150) {
                let filteredLength = channels.length;
                if (searchQuery.trim() !== '') {
                    const query = searchQuery.toLowerCase().trim();
                    filteredLength = channels.filter(ch =>
                        ch.name.toLowerCase().includes(query) ||
                        (ch.group && ch.group.toLowerCase().includes(query))
                    ).length;
                } else if (showFavoritesOnly) {
                    filteredLength = channels.filter(ch => favorites.includes(ch.name)).length;
                } else if (currentCategory !== 'All') {
                    filteredLength = channels.filter(ch => ch.group === currentCategory).length;
                }

                if (visibleCount < filteredLength) {
                    isLoadingMore = true;
                    visibleCount += 80;
                    renderChannels();
                    // Clear the lock asynchronously once rendering is done
                    setTimeout(() => {
                        isLoadingMore = false;
                    }, 100);
                }
            }
        });
    }

    // Start loading
    loadChannels();
});
