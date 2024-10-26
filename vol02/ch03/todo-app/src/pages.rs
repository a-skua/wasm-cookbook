use crate::app::Route;
use web_sys::wasm_bindgen::JsCast;
use web_sys::HtmlInputElement;
use yew::prelude::*;
use yew_router::prelude::*;

static mut TODO_LIST: Vec<TODO> = Vec::new();

pub struct TODO {
    name: String,
    completed: bool,
}

#[function_component(Home)]
pub fn home() -> Html {
    let todo_list = unsafe { TODO_LIST.iter() }
        .enumerate()
        .map(|(index, todo)| if  todo.completed {
            None
        } else {
            Some(html! {
                <li>
                    <input type="checkbox" disabled={ true } checked={ todo.completed } />
                    <Link<Route> to={ Route::Todo { index } }>{ todo.name.clone() }</Link<Route>>
                </li>
            })
        })
        .flatten()
        .collect::<Html>();

    html! {
        <main>
            <h1>{ "My TODO" }</h1>
            <ul>
                <li>
                    <Link<Route> to={Route::New}>{ "New" }</Link<Route>>
                </li>
                { todo_list }
            </ul>
        </main>
    }
}

#[function_component(New)]
pub fn new() -> Html {
    let todo = use_state(|| "".to_string());

    let oninput = {
        let todo = todo.clone();
        Callback::from(move |event: InputEvent| {
            let target = event.target().unwrap();
            todo.set(target.unchecked_into::<HtmlInputElement>().value());
        })
    };

    let onclick = {
        let navigator = use_navigator().unwrap();
        let todo = todo.clone();
        Callback::from(move |_| unsafe {
            TODO_LIST.push(TODO {
                name: todo.to_string(),
                completed: false,
            });
            navigator.push(&Route::Home);
        })
    };

    html! {
        <main>
            <h1>{ "New" }</h1>
            <p class="flex">
                <input type="text" { oninput } />
                <button { onclick }>{ "Add Todo" }</button>
            </p>
        </main>
    }
}

#[derive(Clone, Properties, PartialEq)]
pub struct TodoProps {
    pub index: usize,
}

#[function_component(Todo)]
pub fn todo(props: &TodoProps) -> Html {
    let todo = match unsafe { TODO_LIST.get(props.index) } {
        Some(todo) => todo,
        None => return html! { <NotFound /> },
    };

    let onchange = {
        let navigator = use_navigator().unwrap();
        let index = props.index;
        Callback::from(move |event: Event| {
            let target = event.target().unwrap();
            let completed = target.unchecked_into::<HtmlInputElement>().checked();
            unsafe { TODO_LIST[index].completed = completed };
            navigator.push(&Route::Home);
        })
    };

    html! {
        <main>
            <h1>{ todo.name.clone() }</h1>
            <p>
                <input id="is-completed" type="checkbox" {onchange} checked={ todo.completed } />
                <label for="is-completed">{ "Completed" }</label>
            </p>
        </main>
    }
}

#[function_component(NotFound)]
pub fn not_found() -> Html {
    html! {
        <main>
            <h1 class="not-found">{ "Not Found" }</h1>
        </main>
    }
}
