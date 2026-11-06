from typing import Optional
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User
from app.services.auth_service import auth_service
from app.services.student_service import student_service


def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Extrae el usuario autenticado a partir del header Authorization Bearer si esta presente y es valido.
    Retorna None si no hay token o si este es invalido.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.split(" ", 1)[1].strip()
    payload = auth_service.decode_access_token(token)
    if not payload:
        return None

    user_id = payload.get("user_id") or payload.get("sub")
    if not user_id:
        return None

    try:
        user = db.query(User).filter_by(id=int(user_id)).first()
    except (ValueError, TypeError):
        user = db.query(User).filter_by(email=str(user_id)).first()

    return user


def get_current_user(
    user: Optional[User] = Depends(get_current_user_optional),
) -> User:
    """
    Exige autenticacion obligatoria mediante token Bearer.
    Lanza HTTPException 401 si el usuario no esta autenticado.
    """
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_active_student(
    user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
) -> User:
    """
    Retorna el usuario autenticado si existe; de lo contrario retorna el usuario demo
    de UPCH para permitir exploracion y simulaciones fluidas.
    """
    if user is not None:
        return user
    return student_service.get_or_create_demo_user(db)
