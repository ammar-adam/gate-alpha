from fastapi import APIRouter, Query

from app.models.schemas import SearchResultItem

router = APIRouter(tags=["search"])

# Mock search results: 20–30 flights for any query
_MOCK_SEARCH: list[SearchResultItem] = [
    SearchResultItem(ident="UA4469", route="EWR → LAX", status="DELAYED", departure_time="14:30"),
    SearchResultItem(ident="UA101", route="EWR → LAX", status="ON_TIME", departure_time="08:00"),
    SearchResultItem(ident="UA502", route="ORD → DEN", status="ON_TIME", departure_time="06:45"),
    SearchResultItem(ident="AA100", route="JFK → MIA", status="ON_TIME", departure_time="07:15"),
    SearchResultItem(ident="AA200", route="JFK → MIA", status="DELAYED", departure_time="12:00"),
    SearchResultItem(ident="DL404", route="ATL → JFK", status="CANCELLED", departure_time="16:20"),
    SearchResultItem(ident="DL500", route="ATL → LAX", status="ON_TIME", departure_time="09:30"),
    SearchResultItem(ident="AC123", route="YYZ → YVR", status="ON_TIME", departure_time="10:00"),
    SearchResultItem(ident="AC456", route="YYZ → YUL", status="ON_TIME", departure_time="11:30"),
    SearchResultItem(ident="WN200", route="BWI → MDW", status="ON_TIME", departure_time="13:00"),
    SearchResultItem(ident="B6123", route="JFK → BOS", status="ON_TIME", departure_time="14:15"),
    SearchResultItem(ident="UA300", route="SFO → SEA", status="ON_TIME", departure_time="15:45"),
    SearchResultItem(ident="AA300", route="DFW → ORD", status="DELAYED", departure_time="16:00"),
    SearchResultItem(ident="DL600", route="DTW → MCO", status="ON_TIME", departure_time="17:20"),
    SearchResultItem(ident="UA700", route="DEN → SFO", status="ON_TIME", departure_time="18:00"),
    SearchResultItem(ident="AS100", route="SEA → SAN", status="ON_TIME", departure_time="06:30"),
    SearchResultItem(ident="NK50", route="FLL → LGA", status="ON_TIME", departure_time="08:45"),
    SearchResultItem(ident="F9100", route="DEN → RNO", status="ON_TIME", departure_time="10:20"),
    SearchResultItem(ident="UA800", route="IAH → EWR", status="DELAYED", departure_time="11:00"),
    SearchResultItem(ident="AA400", route="LAX → ORD", status="ON_TIME", departure_time="12:30"),
    SearchResultItem(ident="DL700", route="MSP → PHX", status="ON_TIME", departure_time="13:15"),
    SearchResultItem(ident="WN300", route="DAL → HOU", status="ON_TIME", departure_time="14:45"),
    SearchResultItem(ident="AC789", route="YVR → YYZ", status="ON_TIME", departure_time="15:30"),
    SearchResultItem(ident="UA900", route="BOS → DCA", status="ON_TIME", departure_time="16:45"),
    SearchResultItem(ident="AA500", route="PHX → JFK", status="ON_TIME", departure_time="17:00"),
]


@router.get("/search", response_model=list[SearchResultItem])
async def search_flights(
    q: str = Query("", description="Search by airport, airline, or route"),
) -> list[SearchResultItem]:
    q = (q or "").strip().upper()
    if not q:
        return _MOCK_SEARCH[:20]
    out = [r for r in _MOCK_SEARCH if q in r.ident or q in r.route.replace(" ", "").replace("→", "")]
    return out[:30] if out else _MOCK_SEARCH[:20]
