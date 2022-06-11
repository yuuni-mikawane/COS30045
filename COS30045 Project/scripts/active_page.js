function Active() {
    if(window.location.pathname.includes("vis2"))
    {
        document.getElementsByClassName("vis2Button")[0]
                .className += " active";
    }
    else{
        document.getElementsByClassName("indexButton")[0]
                .className += " active";
    }
}

Active();