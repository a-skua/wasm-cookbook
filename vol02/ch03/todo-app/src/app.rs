use crate::pages;
use yew::prelude::*;
use yew_router::prelude::*;

#[derive(Clone, Routable, PartialEq)]
pub enum Route {
    #[at("/")]
    Home,
    #[at("/new")]
    New,
    #[at("/:index")]
    Todo { index: usize },
    #[not_found]
    #[at("/not-found")]
    NotFound,
}

fn switch(route: Route) -> Html {
    match route {
        Route::Home => html! { <pages::Home /> },
        Route::New => html! { <pages::New /> },
        Route::Todo { index } => html! { <pages::Todo index={ index } /> },
        Route::NotFound => html! { <pages::NotFound /> },
    }
}

#[function_component(App)]
pub fn app() -> Html {
    html! {
        <BrowserRouter>
            <Switch<Route> render={ switch } />
        </BrowserRouter>
    }
}
