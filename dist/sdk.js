(function(window) {
  'use strict';

  const SDK = {
    async init(config = {}) {
      const scriptTag = document.currentScript;

      // 1. 기본 속성 수집
      const projectKey     = config.projectKey || scriptTag?.dataset.key;
      const injectedApiUrl = config.apiUrl || scriptTag?.dataset.api;

      // 2. apiUrl 분기 처리
      const host = location.hostname;
      const defaultApiUrl = host.includes('localhost')
        ? 'http://localhost:8080'
        : 'https://sdk-behavior-trigger-mvp.onrender.com';

      this.apiUrl     = injectedApiUrl || defaultApiUrl;
      this.projectKey = projectKey;
      this.scrollThresh = config.scrollThreshold || 0.3;

      // 3. 이후 로직 (visitorId 발급 → 조건 조회 → 로그 전송 등)
      await this._ensureVisitorId();
      this._conditions = await this._fetchConditions();

      this._checkAndSend('page_view', { pageUrl: location.href });
      this._bindStayTime();
      this._bindScrollDepth(this.scrollThresh);
      this._bindClicks();
    },

    async _fetchConditions() {
      try {
        const res = await fetch(`${this.apiUrl}/api/conditions/${this.projectKey}`, {
          headers: {
            'Content-Type': 'application/json',
            'X-Domain': this.domain
          }
        });
        if (!res.ok) throw new Error('조건 조회 실패');
        return await res.json();
      } catch (err) {
        console.warn('조건 조회 중 오류 발생', err);
        return [];
      }
    },

    _checkAndSend(eventType, data) {
      const matched = this._conditions.find(c => c.eventType === eventType && c.pageUrl === location.href);
      if (!matched) return;

      const payload = { pageUrl: location.href, ...data, conditionId: matched.id };
      this._sendEvent(eventType, payload);
    },

    _sendEvent(eventType, payload = {}) {
      const visitorId = this._getVisitorId();
      if (!visitorId) return;

      const url = new URL(`${this.apiUrl}/api/logs`);
      url.searchParams.set('projectId', this.projectKey);
      url.searchParams.set('visitorId', visitorId);

      fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Domain': this.domain
        },
        body: JSON.stringify({
          eventType,
          occurredAt: new Date().toISOString(),
          ...payload
        }),
        keepalive: true
      });
    },

    _bindStayTime() {
      const stayConditions = this._conditions.filter(c => c.eventType === 'stay_time' && c.pageUrl === location.href);
      stayConditions.forEach(condition => {
        setTimeout(() => {
          this._checkAndSend('stay_time', {
            durationMs: condition.threshold * 1000
          });
        }, condition.threshold * 1000);
      });
    },

    _bindScrollDepth(threshold) {
      let fired = false;
      window.addEventListener('scroll', () => {
        if (fired) return;
        const scrolled = window.scrollY + window.innerHeight;
        const total = document.documentElement.scrollHeight;
        if (scrolled / total >= threshold) {
          fired = true;
          this._checkAndSend('scroll_depth', { depthRatio: threshold });
        }
      });
    },

    _bindClicks() {
      document.addEventListener('click', e => {
        const t = e.target, tag = t.tagName.toLowerCase();
        let label = t.id ? `#${t.id}` : t.name ? `[name=${t.name}]`
                  : t.innerText?.trim().slice(0,20) || '';
        this._checkAndSend('click', { element: tag, label });
      });
    },

    async _ensureVisitorId() {
      const key = 'visitorId';
      let vid = localStorage.getItem(key)
             || document.cookie.match(/visitorId=([^;]+)/)?.[1];

      if (!vid) {
        const res = await fetch(
          `${this.apiUrl}/api/visitors?projectId=${this.projectKey}`,
          {
            method: 'POST',
            headers: {
              'X-Domain': this.domain
            }
          }
        );
        if (!res.ok) {
          console.warn('visitor 발급 실패', res.status);
          return;
        }
        const { id } = await res.json();
        vid = id;
        localStorage.setItem(key, vid);
        document.cookie = `visitorId=${vid}; path=/;`;
      }
    },

    _getVisitorId() {
      return localStorage.getItem('visitorId')
          || document.cookie.match(/visitorId=([^;]+)/)?.[1]
          || null;
    }
  };

  window.BehaviorSDK = SDK;

})(window);
