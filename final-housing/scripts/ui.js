window.addEventListener("load", function(){
   
    //enable/disable panes
    d3.selectAll('.nav-option').on('click', function(d,i) {
        d3.selectAll('.nav-option').classed('selected', false);
        sel = d3.select(this);
        sel.classed('selected', true);

        function slide(selectionOut, selectionIn){
            d3.select(selectionOut).classed('active', false);
            d3.select(selectionIn).classed('active', true)
        };

        d3.selectAll('.pane').classed('active', false);
        if (sel.classed('highlights')){
            slide('.pane-neighb', '.pane-highlights');
        } else if (sel.classed('neighb')){
            slide('.pane-highlights', '.pane-neighb');
            
        }

    });






    

});