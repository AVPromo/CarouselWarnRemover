import logging

from frameworks.wulf import ViewModel
from gui.impl.lobby.hangar.random.random_hangar import RandomHangar
from gui.impl.pub.view_component import ViewComponent

from openwg_gameface import gf_mod_inject, ModDynAccessor, manager


log = logging.getLogger(__name__)


def overrideIn(cls, condition=lambda: True):
    def _overrideMethod(func):
        if not condition():
            return func

        funcName = func.__name__

        if funcName.startswith("__"):
            funcName = "_" + cls.__name__ + funcName

        old = getattr(cls, funcName)

        def wrapper(*args, **kwargs):
            return func(old, *args, **kwargs)

        setattr(cls, funcName, wrapper)
        return wrapper
    return _overrideMethod


CAROUSEL_WARN_REMOVER_VIEW = "pruszko.carousel_warn_remover.view"


class CarouselWarnRemoverModel(ViewModel):

    def __init__(self, properties=0, commands=0):
        super(CarouselWarnRemoverModel, self).__init__(properties=properties, commands=commands)

    def _initialize(self):
        super(CarouselWarnRemoverModel, self)._initialize()

        gf_mod_inject(
            model=self,
            name=CAROUSEL_WARN_REMOVER_VIEW,
            modules=[
                'coui://gui/gameface/carousel_warn_remover/CarouselWarnRemoverView.js'
            ],
        )


class CarouselWarnRemoverView(ViewComponent[CarouselWarnRemoverModel]):

    VIEW_LAYOUT_ID = ModDynAccessor(CAROUSEL_WARN_REMOVER_VIEW)

    def __init__(self):
        super(CarouselWarnRemoverView, self).__init__(
            layoutID=CarouselWarnRemoverView.VIEW_LAYOUT_ID(),
            model=CarouselWarnRemoverModel
        )

    @property
    def viewModel(self):
        return super(CarouselWarnRemoverView, self).getViewModel()

    def _finalize(self):
        super(CarouselWarnRemoverView, self)._finalize()


@overrideIn(RandomHangar)
def _initChildren(func, self):
    self = self  # type: RandomHangar
    func(self)

    if not manager.isResMapValidated:
        return

    self.setChildView(
        resourceID=CarouselWarnRemoverView.VIEW_LAYOUT_ID(),
        view=CarouselWarnRemoverView()
    )
