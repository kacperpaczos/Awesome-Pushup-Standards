from demo import add

def test_add():
    if add(1, 2) != 3:
        raise AssertionError("expected 3")
