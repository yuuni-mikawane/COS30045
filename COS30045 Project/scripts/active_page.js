function Active() {
    if(window.location.pathname.includes("index"))
    {
        document.getElementsByClassName("indexButton")[0]
                .className += " active";
    }
    else{
        document.getElementsByClassName("vis2Button")[0]
                .className += " active";
    }
}

Active();