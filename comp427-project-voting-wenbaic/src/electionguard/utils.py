from typing import Callable, Optional, TypeVar, List, cast

_T = TypeVar("_T")
_U = TypeVar("_U")


def get_optional(optional: Optional[_T]) -> _T:
    """
    General-purpose unwrapping function to handle `Optional`.
    Raises an exception if it's actually `None`, otherwise
    returns the internal type.
    """
    assert optional is not None, "Unwrap called on None"
    return optional


def match_optional(
    optional: Optional[_T], none_func: Callable[[], _U], some_func: Callable[[_T], _U]
) -> _U:
    """
    General-purpose pattern-matching function to handle `Optional`.
    If it's actually `None`, the `none_func` lambda is called.
    Otherwise, the `some_func` lambda is called with the value.
    """
    if optional is None:
        return none_func()
    else:
        return some_func(optional)


def get_or_else_optional(optional: Optional[_T], alt_value: _T) -> _T:
    """
    General-purpose getter for `Optional`. If it's `None`, returns the `alt_value`.
    Otherwise, returns the contents of `optional`.
    """
    if optional is None:
        return alt_value
    else:
        return optional


def get_or_else_optional_func(optional: Optional[_T], func: Callable[[], _T]) -> _T:
    """
    General-purpose getter for `Optional`. If it's `None`, calls the lambda `func`
    and returns its value. Otherwise, returns the contents of `optional`.
    """
    if optional is None:
        return func()
    else:
        return optional


def flatmap_optional(
    optional: Optional[_T], mapper: Callable[[_T], _U]
) -> Optional[_U]:
    """
    General-purpose flatmapping on `Optional`. If it's `None`, returns `None` as well,
    otherwise returns the lambda applied to the contents.
    """
    if optional is None:
        return None
    else:
        return mapper(optional)


def list_of_option_to_option_list(input: List[Optional[_T]]) -> Optional[List[_T]]:
    """
    General-purpose cleanup of lists that might have None in them. If None is anywhere
    in the list, the result is None. Otherwise, we get back the list without `Optional`
    in its type parameter. You might then, process the results like so::
      x: List[Optional[Whatever]] = list_that_might_have_none_inside
      y: Optional[List[Whatever]] = list_of_options_to_option_list(x)
      if y is None:
          # fail somehow
      else:
          # mypy now infers that the type of y is List[Whatever]
    """
    if None in input:
        return None
    else:
        result = cast(List[_T], input)
        return result
