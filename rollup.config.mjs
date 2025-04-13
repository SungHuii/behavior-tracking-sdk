export default {
    input: 'sdk/index.js',
    output: {
        file: 'dist/sdk.js',
        format: 'iife', // 브라우저에서 즉시 실행 가능한 글로벌 함수
        name: 'BehaviorSDK'
    }
};