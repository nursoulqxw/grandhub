from .models import User
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from .schemes import UserCreateModel
from .utils import generate_password_hash

class UserService:
    _LIST_FIELDS = {"preferred_types", "countries"}

    def _serialize_profile_fields(self, data: dict) -> dict:
        normalized = dict(data)
        for field in self._LIST_FIELDS:
            value = normalized.get(field)
            if isinstance(value, list):
                normalized[field] = ",".join(item.strip() for item in value if item and item.strip())
        return normalized

    async def get_user_by_email(self, email:str, session: AsyncSession):
        statement = select(User).where(User.email == email)

        result = await session.exec(statement)

        user = result.first()

        return user
    
    async def user_exists(self, email: str, session: AsyncSession):
        user = await self.get_user_by_email(email, session)

        return True if user is not None else False

    async def create_user(self, user_data: UserCreateModel, session: AsyncSession):
        user_data_dict = self._serialize_profile_fields(user_data.model_dump())
        password = user_data_dict.pop("password")
        
        new_user = User(**user_data_dict)

        new_user.password_hash = generate_password_hash(password)
        new_user.role="user"

        session.add(new_user)
        await session.commit()

        return new_user
    
    async def update_user(self, user: User, user_data: dict, session: AsyncSession):
        user_data = self._serialize_profile_fields(user_data)
        for k,v in user_data.items():
            setattr(user, k, v)

        await session.commit()

        return user
