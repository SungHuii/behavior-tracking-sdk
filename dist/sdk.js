// sdk.js
(function(window) {
  'use strict';

  // SDK 전역 네임스페이스
  const SDK = {
    init({ apiUrl, projectKey, scrollThreshold = 0.3 }) {
      this.apiUrl     = apiUrl.replace(/\/+$/, ''); // 끝 / 제거
      this.projectKey = projectKey;

      this._sendEvent('page_view', { pageUrl: location.href });
      this._bindStayTime();
      this._bindScrollDepth(scrollThreshold);
      this._bindClicks();
    },

    // 내부: 이벤트 전송 공통
    _sendEvent(eventType, payload = {}) {
      const visitorId = this._getVisitorId();
      const body = {
        projectId: this.projectKey,
        visitorId,
        eventType,
        occurredAt: new Date().toISOString(),
        ...payload
      };
      // navigator.sendBeacon 지원 시 이걸 써도 좋습니다
      fetch(`${this.apiUrl}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true
      });
    },

    // stay_time 바인딩
    _bindStayTime() {
      const start = Date.now();
      window.addEventListener('beforeunload', () => {
        const duration = Date.now() - start;
        this._sendEvent('stay_time', { durationMs: duration });
      });
    },

    // scroll_depth 바인딩 (페이지 높이 대비 비율)
    _bindScrollDepth(threshold) {
      let fired = false;
      window.addEventListener('scroll', () => {
        if (fired) return;
        const scrolled = window.scrollY + window.innerHeight;
        const total    = document.documentElement.scrollHeight;
        if (scrolled / total >= threshold) {
          fired = true;
          this._sendEvent('scroll_depth', { depthRatio: threshold });
        }
      });
    },

    // click 바인딩 (버튼, a 태그 등 모두)
    _bindClicks() {
      document.addEventListener('click', e => {
        const target = e.target;
        const tag    = target.tagName.toLowerCase();
        let label     = '';
        if (target.id)     label = `#${target.id}`;
        else if (target.name) label = `[name=${target.name}]`;
        else if (target.innerText) label = target.innerText.trim().slice(0,20);

        this._sendEvent('click', { element: tag, label });
      });
    },

    // visitorId 발급/조회
    _getVisitorId() {
      const key = 'visitorId';
      let vid = localStorage.getItem(key);
      if (vid) return vid;

      // 없으면 동기 요청으로 visitor 생성 (간단 예시)
      const resp = prompt('visitorId 없어서 생성된 키를 붙여주세요');
      // → 실제론 fetch 동기 요청이나 sendBeacon을 쓰지 않습니다.
      vid = resp || 'anonymous';
      localStorage.setItem(key, vid);
      return vid;
    }
  };

  // 전역에 노출
  window.BehaviorSDK = SDK;

})(window);
