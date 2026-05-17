from pydantic import BaseModel


class UserItem(BaseModel):
    id: str
    username: str

    model_config = {"from_attributes": True}
