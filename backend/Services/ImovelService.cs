using CorretoraJenissonLuckwuAPI.Models.Entities;
using CorretoraJenissonLuckwuAPI.Repository;

namespace CorretoraJenissonLuckwuAPI.Services
{
    public class ImovelService
    {
        private readonly ImovelRepository _repository;

        public ImovelService(ImovelRepository repository)
        {
            _repository = repository;
        }

        public async Task<Imovel?> GetById(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<List<Imovel>> GetAll()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Imovel?> Add(Imovel imovel)
        {
            return await _repository.AddAsync(imovel);
        }

        public async Task<Imovel?> Update(int id, Imovel imovel)
        {
            return await _repository.UpdateAsync(id, imovel);
        }

        public async Task<Imovel?> Delete(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        public async Task<List<Imovel>> GetByCidade(string cidade)
        {
            return await _repository.GetByCidadeAsync(cidade);
        }

        public async Task<List<Imovel>> GetByTipo(string tipo)
        {
            return await _repository.GetByTipoAsync(tipo);
        }

        public async Task<List<Imovel>> GetByStatus(StatusImovel status)
        {
            return await _repository.GetByStatusAsync(status);
        }

        public async Task<List<Imovel>> GetByPrecoRange(decimal precoMin, decimal precoMax)
        {
            return await _repository.GetByPrecoRangeAsync(precoMin, precoMax);
        }

        public async Task<Imovel?> UpdateAtivo(int id, bool ativo)
        {
            return await _repository.UpdateAtivoAsync(id, ativo);
        }
    }
}

