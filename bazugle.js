
let drag_list = null;

function copy_clipboard(string){
    var temp = document.createElement('div');

    temp.appendChild(document.createElement('pre')).textContent = string;

    var s = temp.style;
    s.position = 'fixed';
    s.left = '-100%';

    document.body.appendChild(temp);
    document.getSelection().selectAllChildren(temp);

    var result = document.execCommand('copy');

    document.body.removeChild(temp);

    return result;
}

function once (query, event, func) {
    query.each(function() {
        if ($(this).data(event)) return;
        $(this).on(event, func);
        $(this).data(event, 1);
    });
};

function save() {
    localStorage.setItem('bazugle_draft', $('#view').html());
}

function update () {
    once($('.item-append'), 'click', e => {
        let d = $(e.target);
        if (e.target.tagName == 'SPAN') d = d.parent();
        d.before(`
                <div class="item">
                    <div class="item-inner" contenteditable>
New Item
                    </div>
                    <span class="item-delete">✕</span>
                </div>
`);
        $('.item-delete').click(e => {
            $(e.target).parent().remove();
        });
        save();
    });

    once($('.item'), 'input', e => {
        save();
    });


    once($('.item-delete'), 'click', e => {
        $(e.target).parent().remove();
        save();
    });

    once($('.category-delete'), 'click', e => {
        $(e.target).parent().remove();
        save();
    });

    once($('.list-title'), 'dblclick', e => {
        let i = $(e.target).attr('contenteditable') != "true";
        if (i) $(e.target).addClass('active');
        else $(e.target).removeClass('active');
        $(e.target).attr('contenteditable', i);
    });
    once($('.list-title'), 'mousedown', e => {
        $(e.target).data('drag', true);
        $(e.target).data('drag-offset', {pageY: e.pageY-$(e.target).offset().top, pageX: e.pageX-$(e.target).offset().left});
        drag_list = $(e.target);
    });
    once($('.list-title'), 'mouseup', e => {
        $(e.target).data('drag', false);
        drag_list = null;
        save();
    });
}

$(() => {

    if (localStorage.getItem('bazugle_draft'))
        $('#view').html(localStorage.getItem('bazugle_draft'));


    $('#category-append').click(e => {
        $('#view').append(`
            <div class="list">
                <h2 class="list-title unselectable" contenteditable="false">New Category</h2>
                <span class="category-delete">✕</span>

                <div class="item item-append">
                    <span>APPEND NEW ITEM</span>
                </div>
            </div>
`);
        update();
        save();
    });

    $('#export').click(() => {
        let result = copy_clipboard($('#view').html());
        if (!result) alert('Failed!');
        else alert('Code has been copied. Go to the another browser and paste it in a textbox by the `Import` button.');
    });

    $('#import').click(() => {
        if (!confirm("I'll eat the code written in a textbox next of me. This may destroy your precious data. Are you sure?")) return;

        localStorage.setItem('bazugle_draft', $('#import-value').val());
        $('#view').html($('#import-value').val());

        alert("Successfully imported.");
    });

    update();

    $(document).mousemove(e => {
        if (!drag_list) return;
        if (drag_list.data('drag') && drag_list.attr('contenteditable') == "false") {
            let dragofs = drag_list.data('drag-offset');
            drag_list.parent().offset({top: e.pageY-dragofs.pageY, left: e.pageX-dragofs.pageX});
        };
    });
});
