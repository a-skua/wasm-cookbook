#[doc(hidden)]
#[allow(non_snake_case)]
pub unsafe fn _export_run_cabi<T: Guest>() {
    #[cfg(target_arch = "wasm32")] _rt::run_ctors_once();
    T::run();
}
pub trait Guest {
    fn run();
}
#[doc(hidden)]
macro_rules! __export_world_example_cabi {
    ($ty:ident with_types_in $($path_to_types:tt)*) => {
        const _ : () = { #[export_name = "run"] unsafe extern "C" fn export_run() {
        $($path_to_types)*:: _export_run_cabi::<$ty > () } };
    };
}
#[doc(hidden)]
pub(crate) use __export_world_example_cabi;
#[allow(dead_code)]
pub mod vscode {
    #[allow(dead_code)]
    pub mod example {
        #[allow(dead_code, clippy::all)]
        pub mod vscode {
            #[used]
            #[doc(hidden)]
            static __FORCE_SECTION_REF: fn() = super::super::super::__link_custom_section_describing_imports;
            #[allow(unused_unsafe, clippy::all)]
            pub fn show_information_message(message: &str) {
                unsafe {
                    let vec0 = message;
                    let ptr0 = vec0.as_ptr().cast::<u8>();
                    let len0 = vec0.len();
                    #[cfg(target_arch = "wasm32")]
                    #[link(wasm_import_module = "vscode:example/vscode")]
                    extern "C" {
                        #[link_name = "show-information-message"]
                        fn wit_import(_: *mut u8, _: usize);
                    }
                    #[cfg(not(target_arch = "wasm32"))]
                    fn wit_import(_: *mut u8, _: usize) {
                        unreachable!()
                    }
                    wit_import(ptr0.cast_mut(), len0);
                }
            }
        }
    }
}
mod _rt {
    #[cfg(target_arch = "wasm32")]
    pub fn run_ctors_once() {
        wit_bindgen_rt::run_ctors_once();
    }
}
/// Generates `#[no_mangle]` functions to export the specified type as the
/// root implementation of all generated traits.
///
/// For more information see the documentation of `wit_bindgen::generate!`.
///
/// ```rust
/// # macro_rules! export{ ($($t:tt)*) => (); }
/// # trait Guest {}
/// struct MyType;
///
/// impl Guest for MyType {
///     // ...
/// }
///
/// export!(MyType);
/// ```
#[allow(unused_macros)]
#[doc(hidden)]
macro_rules! __export_example_impl {
    ($ty:ident) => {
        self::export!($ty with_types_in self);
    };
    ($ty:ident with_types_in $($path_to_types_root:tt)*) => {
        $($path_to_types_root)*:: __export_world_example_cabi!($ty with_types_in
        $($path_to_types_root)*);
    };
}
#[doc(inline)]
pub(crate) use __export_example_impl as export;
#[cfg(target_arch = "wasm32")]
#[link_section = "component-type:wit-bindgen:0.31.0:vscode:example:example:encoded world"]
#[doc(hidden)]
pub static __WIT_BINDGEN_COMPONENT_TYPE: [u8; 243] = *b"\
\0asm\x0d\0\x01\0\0\x19\x16wit-component-encoding\x04\0\x07v\x01A\x02\x01A\x04\x01\
B\x02\x01@\x01\x07messages\x01\0\x04\0\x18show-information-message\x01\0\x03\x01\
\x15vscode:example/vscode\x05\0\x01@\0\x01\0\x04\0\x03run\x01\x01\x04\x01\x16vsc\
ode:example/example\x04\0\x0b\x0d\x01\0\x07example\x03\0\0\0G\x09producers\x01\x0c\
processed-by\x02\x0dwit-component\x070.216.0\x10wit-bindgen-rust\x060.31.0";
#[inline(never)]
#[doc(hidden)]
pub fn __link_custom_section_describing_imports() {
    wit_bindgen_rt::maybe_link_cabi_realloc();
}
