var HistoryShared = (function () {
    var undoStack = [];
    var redoStack = [];
    var isApplyingHistoryState = false;
    var historyPushTimer = null;

    function captureUIState() {
        var controls = document.querySelectorAll('input[id], select[id], textarea[id]');
        var state = {};
        controls.forEach(function (el) {
            if (!el.id) return;
            if (el.type === 'file') return;
            state[el.id] = (el.type === 'checkbox' || el.type === 'radio') ? !!el.checked : el.value;
        });
        return state;
    }

    function applyUIState(state) {
        if (!state) return;
        isApplyingHistoryState = true;
        for (var id in state) {
            if (!Object.prototype.hasOwnProperty.call(state, id)) continue;
            var el = document.getElementById(id);
            if (!el) continue;
            if (el.type === 'checkbox' || el.type === 'radio') el.checked = !!state[id];
            else el.value = state[id];
        }
        isApplyingHistoryState = false;
        if (typeof SceneSetup3D !== 'undefined' && SceneSetup3D.applyDisplayOptions) SceneSetup3D.applyDisplayOptions();
        if (typeof updateBouteille === 'function') updateBouteille();
        if (typeof draw2D === 'function') draw2D();
    }

    function statesEqual(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    function init() {
        var btnUndo = document.getElementById('btn-undo');
        var btnRedo = document.getElementById('btn-redo');
        if (!btnUndo || !btnRedo) return;

        function updateUndoRedoButtons() {
            btnUndo.disabled = undoStack.length <= 1;
            btnRedo.disabled = redoStack.length === 0;
        }

        function pushHistorySnapshot() {
            if (isApplyingHistoryState) return;
            var snap = captureUIState();
            var last = undoStack.length ? undoStack[undoStack.length - 1] : null;
            if (!last || !statesEqual(last, snap)) {
                undoStack.push(snap);
                if (undoStack.length > 120) undoStack.shift();
                redoStack = [];
                updateUndoRedoButtons();
            }
        }

        function scheduleHistorySnapshot() {
            if (isApplyingHistoryState) return;
            if (historyPushTimer) clearTimeout(historyPushTimer);
            historyPushTimer = setTimeout(pushHistorySnapshot, 120);
        }

        if (!btnUndo.dataset.bound) {
            btnUndo.dataset.bound = '1';
            btnUndo.addEventListener('click', function () {
                if (undoStack.length <= 1) return;
                var current = undoStack.pop();
                redoStack.push(current);
                var previous = undoStack[undoStack.length - 1];
                applyUIState(previous);
                updateUndoRedoButtons();
            });
        }
        if (!btnRedo.dataset.bound) {
            btnRedo.dataset.bound = '1';
            btnRedo.addEventListener('click', function () {
                if (!redoStack.length) return;
                var next = redoStack.pop();
                undoStack.push(next);
                applyUIState(next);
                updateUndoRedoButtons();
            });
        }

        document.addEventListener('input', function () { scheduleHistorySnapshot(); });
        document.addEventListener('change', function () { scheduleHistorySnapshot(); });
        if (!undoStack.length) undoStack.push(captureUIState());
        updateUndoRedoButtons();
    }

    return {
        init: init
    };
})();
